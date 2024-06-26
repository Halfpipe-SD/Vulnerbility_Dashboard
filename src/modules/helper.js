import {
  get_artifacts_by_job_name,
  get_artifacts_by_job_names,
  get_job_names_with_reports
} from "./gitlab.js";

import cwe_list from "../assets/cwe_list.json";

/**
 * Qualitative Severity Rating Scale.
 * @see https://www.first.org/cvss/specification-document#Base-Metrics
 * Rating: None (CVSS Score 0.0)
 * Rating: Low (CVSS Score 0.1-3.9)
 * Rating: Medium (CVSS Score 4.0-6.9)
 * Rating: High (CVSS Score 7.0-8.9)
 * Rating: Critical (CVSS Score 9.0-10.0)
 */

const Severity = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  CRITICAL: "CRITICAL"
};

/**
 * Transforms the severity string into the corresponding Severity value.
 *
 * @param {string} str - The severity string.
 * @returns {string} The transformed severity value.
 */
function transform_severity(str) {
  switch (str.toUpperCase()) {
    case "LOW":
    case "WARNING":
    case "INFORMATIONAL":
    case "UNKNOWN":
      return Severity.LOW;
    case "MODERATE":
    case "MEDIUM":
      return Severity.MEDIUM;
    case "HIGH":
      return Severity.HIGH;
    case "CRITICAL":
      return Severity.CRITICAL;
    default:
      console.log(`Unknown severity: ${str}`);
  }
}

/**
 * Retrieves SAST Semgrep data from the given artifact.
 *
 * @param {Object} artifact - The artifact data.
 * @returns {Promise<Object[]>} An array of SAST Semgrep data.
 */
async function get_sast_semgrep(artifact) {
  // build new array with only the relevant data
  return artifact.data.results.map((el) => {
    return {
      job: "sast-semgrep",
      description: el.extra.message,
      file: {
        path: el.path,
        line: el.end.line,
        column: el.end.col
      },
      vulnerability: {
        cve: null,
        cvss: null,
        cwe: transform_CWE(el.extra.metadata.cwe),
        owasp: el.extra.metadata.owasp,
        severity: transform_severity(el.extra.severity),
        confidence: el.extra.metadata.confidence,
        reference: el.extra.metadata.source
      },
      dependency: null
    };
  });
}

/**
 * Retrieves SAST Gitleaks data from the given artifact.
 *
 * @param {Object} artifact - The artifact data.
 * @returns {Promise<Object[]>} An array of SAST Gitleaks data.
 */
async function get_sast_gitleaks(artifact) {
  // remove duplicates
  // get latest object in array by Date
  const latest = artifact.data.reduce((latest, el) => {
    return new Date(el.Date) > new Date(latest.Date) ? el : latest;
  });

  // filter out all commits that are not the latest
  const sast_gitleaks_filtered = artifact.data.filter(
    (el) => el.Commit === latest.Commit
  );
  // build new array with only the relevant data
  return sast_gitleaks_filtered.map((el) => {
    return {
      job: "sast-gitleaks",
      description: el.Description,
      file: {
        path: el.File,
        line: el.StartLine,
        column: el.StartColumn
      },
      vulnerability: {
        cve: null,
        cvss: null,
        cwe: {
          short: "CWE-200",
          description:
            "Exposure of Sensitive Information to an Unauthorized Actor",
          likelihood_of_exploit: null,
          observed_examples: null
        },
        owasp: ["A03:2017 - Sensitive Data Exposure"],
        severity: Severity.HIGH,
        confidence: null,
        reference: null
      },
      dependency: null
    };
  });
}

/**
 * Retrieves SCA Package Dependency Check data from the given artifact.
 *
 * @param {Object} artifact - The artifact data.
 * @returns {Promise<Object[]>} An array of SCA Package Dependency Check data.
 */
async function get_sca_package_dep_check(artifact) {
  // filter elements without vulnerabilities array
  artifact.data.dependencies = artifact.data.dependencies.filter(
    (el) => el.vulnerabilities?.length > 0 || el.isVirtual === true
  );

  // build new array with only the relevant data
  const array = [];
  artifact.data.dependencies.forEach((el) => {
    // loop through vulnerabilities array and push each element to new array
    el.vulnerabilities.forEach((vuln) => {
      array.push({
        job: "sca-package-dependency-check",
        description: vuln.description,
        file: {
          path: el.filePath,
          line: null,
          column: null
        },
        vulnerability: {
          cve: vuln.name,
          cvss: vuln.cvssv3?.score || vuln.cvssv2?.score || null,
          cwe: transform_CWE(vuln.cwes),
          owasp: null,
          severity: transform_severity(vuln.severity),
          confidence: null,
          reference: vuln.references[0].url
        },
        dependency: el.fileName
      });
    });
  });
  return array;
}

/**
 * Retrieves SCA Container Trivy data from the given artifact.
 *
 * @param {Object} artifact - The artifact data.
 * @returns {Promise<Object[]>} An array of SCA Container Trivy data.
 */
async function get_sca_container_trivy(artifact) {
  // filter elements without vulnerabilities array
  artifact.data.Results = artifact.data.Results.filter(
    (el) => el.Vulnerabilities?.length > 0
  );

  // build new array with only the relevant data
  const array = [];
  artifact.data.Results.forEach((el) => {
    // loop through vulnerabilities array and push each element to new array
    el.Vulnerabilities.forEach((vuln) => {
      array.push({
        job: "sca-container-trivy",
        description: vuln.Description,
        file: {
          target: el.Target,
          path: vuln.PkgPath || null,
          line: null,
          column: null
        },
        vulnerability: {
          cve: vuln.VulnerabilityID,
          cvss: vuln.CVSS?.nvd?.V3Score || vuln.CVSS?.nvd?.V2Score || null,
          cwe: transform_CWE(vuln.CweIDs),
          owasp: null,
          severity: transform_severity(vuln.Severity),
          confidence: null,
          reference: vuln.PrimaryURL
        },
        dependency: vuln.PkgID
      });
    });
  });
  return array;
}

/**
 * Retrieves DAST ZAP data from the given artifact.
 *
 * @param {Object} artifact - The artifact data.
 * @returns {Promise<Object[]>} An array of DAST ZAP data.
 */
async function get_dast_zap(artifact) {
  // build new array with only the relevant data
  return artifact.data.site[0].alerts.map((el) => {
    return {
      job: "dast-zap",
      description: remove_html_tags(el.desc),
      file: {
        path: null,
        line: null,
        column: null
      },
      vulnerability: {
        cve: null,
        cvss: null,
        cwe: transform_CWE(el.cweid),
        owasp: null,
        severity: transform_severity(el.riskdesc.split(" ")[0]),
        confidence: null,
        reference: remove_html_tags(el.reference)
      },
      dependency: null,
      alert: {
        instances: el.instances,
        count: Number(el.count),
        name: el.name
      }
    };
  });
}

/**
 * Gathers data for all job names.
 *
 * @param {string} project_id - The ID of the project.
 * @returns {Promise<Object[]>} A promise that resolves to an array of report objects.
 */
export async function gather_data(project_id) {
  // get all job_names with reports
  const job_names = get_job_names_with_reports(project_id);
  // get all artifacts at once to safe time
  const artifacts = await get_artifacts_by_job_names(project_id, job_names);
  // resolve promises
  const results = await Promise.all([
    get_sast_semgrep(artifacts[0]),
    get_sast_gitleaks(artifacts[1]),
    get_sca_package_dep_check(artifacts[2]),
    get_sca_container_trivy(artifacts[3]),
    get_dast_zap(artifacts[4])
  ]);
  // combine all arrays into one
  const report_array = results.flatMap((subArray) => subArray);
  return filter_gathered_data(report_array);
}

/**
 * Removes duplicate elements from the given array.
 *
 * @param {Array<Object>} array - The array to filter.
 * @returns
 */
function filter_gathered_data(array) {
  // remove elements with same cve
  return array.filter((el, index, self) => {
    // ignore element if null
    if (!el.vulnerability.cve) return true;
    // find first index of element with same cve and target
    const first_index = self.findIndex(
      (el2) => el2.vulnerability.cve === el.vulnerability.cve
    );
    return index === first_index;
  });
}

/**
 * Retrieves filtered data for a specific job name.
 *
 * @param {string} project_id - The ID of the project.
 * @param {string} job_name - The name of the job.
 * @returns {Promise<Object[]>|null} A promise that resolves to the filtered data for the specified job name, or null if the job name is not found.
 */
export async function get_filtered_data(project_id, job_name) {
  let artifacts;
  switch (job_name) {
    case "sast-semgrep":
      artifacts = await get_artifacts_by_job_name(project_id, job_name);
      return get_sast_semgrep(artifacts[0]);
    case "sast-gitleaks":
      artifacts = await get_artifacts_by_job_name(project_id, job_name);
      return get_sast_gitleaks(artifacts[0]);
    case "sca-package-dependency-check":
      artifacts = await get_artifacts_by_job_name(project_id, job_name);
      return get_sca_package_dep_check(artifacts[0]);
    case "sca-container-trivy":
      artifacts = await get_artifacts_by_job_name(project_id, job_name);
      return get_sca_container_trivy(artifacts[0]);
    case "dast-zap":
      artifacts = await get_artifacts_by_job_name(project_id, job_name);
      return get_dast_zap(artifacts[0]);
    default:
      return null;
  }
}

/**
 * Removes HTML tags from a string.
 *
 * @param {string} str - The string to remove HTML tags from.
 * @returns {string|boolean} The string with HTML tags removed, or false if the input is null or empty.
 */
function remove_html_tags(str) {
  if (str === null || str === "") return false;
  else str = str.toString();
  return str.replace(/<[^>]*>/g, "");
}

/**
 * Transforms the given cwe input into a string or returns null if the input is invalid
 *
 * @param {String | Number | null} input - The input to transform.
 * @returns String or null
 */
function transform_CWE(input) {
  let raw = {
    description: null,
    short: null,
    likelihood_of_exploit: null,
    observed_examples: null
  };
  if (!input) return raw;
  // if more CWEs are found, take the first one (only one case found so far)
  if (Array.isArray(input)) input = input[0];

  // if input is a number, transform it into a string
  if (!isNaN(input)) {
    const i = parseInt(input, 10);
    if (i <= 0) return raw;
    input = `CWE-${i}`;
  }

  // set description and short form
  if (input.split(": ").length > 1) {
    raw.description = input.split(": ")[1];
    raw.short = input.split(": ")[0];
    return raw;
  } else {
    // find cwe in cwe_list and fill in
    const entry = cwe_list.find((entry) => entry.cwe_name === input);
    if (!entry) {
      raw.short = input;
      return raw;
    } else raw.short = entry.cwe_name;
    raw.description = entry.desc;
    raw.likelihood_of_exploit = entry.Likelihood_Of_Exploit;
    raw.observed_examples = entry.observed_examples;
    raw.consequences = entry.consequences;
    return raw;
  }
}
