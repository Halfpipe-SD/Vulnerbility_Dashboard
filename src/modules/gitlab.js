/**
 * This module contains functions to get data from GitLab.
 */

import axios from "../plugins/axios";
import artifact_paths from "../assets/artifact_paths.json";

const GROUP_ID_DEFAULT = 1120;

/**
 * Retrieves group data from GitLab.
 *
 * @param {number} group_id - The ID of the group to retrieve data for. Defaults to GROUP_ID_DEFAULT if not provided.
 * @returns {Promise<object>} - A Promise that resolves to the group data.
 */
export async function get_group_data(group_id = GROUP_ID_DEFAULT) {
  const response = await axios.get(`/api/v4/groups/${group_id}`);
  return response.data;
}

/**
 * Retrieves pipelines for a specific project from GitLab.
 *
 * @param {number} project_id - The ID of the project to retrieve pipelines for.
 * @param {number} [page=1] - The page number to retrieve. Defaults to 1 if not provided.
 * @param {number} [per_page=20] - The number of pipelines per page. Defaults to 20 if not provided.
 * @returns {Promise<object>} - A Promise that resolves to the pipeline data.
 */
export async function get_pipelines(project_id, page = 1, per_page = 20) {
  const response = await axios.get(`/api/v4/projects/${project_id}/pipelines`, {
    params: { page, per_page }
  });
  return response.data;
}

/**
 * Retrieves details of a specific pipeline from GitLab.
 *
 * @param {number} project_id - The ID of the project the pipeline belongs to.
 * @param {number} pipeline_id - The ID of the pipeline to retrieve details for.
 * @returns {Promise<object>} - A Promise that resolves to the pipeline details.
 */
export async function get_pipeline_details(project_id, pipeline_id) {
  const response = await axios.get(
    `/api/v4/projects/${project_id}/pipelines/${pipeline_id}`
  );
  return response.data;
}

/**
 * Retrieves jobs of a specific pipeline from GitLab.
 *
 * @param {number} project_id - The ID of the project the pipeline belongs to.
 * @param {number} pipeline_id - The ID of the pipeline to retrieve jobs for.
 * @returns {Promise<object>} - A Promise that resolves to the pipeline jobs.
 */
export async function get_pipeline_jobs(project_id, pipeline_id) {
  const response = await axios.get(
    `/api/v4/projects/${project_id}/pipelines/${pipeline_id}/jobs`
  );
  return response.data;
}

/**
 * Retrieves a specific job from GitLab.
 *
 * @param {number} project_id - The ID of the project the job belongs to.
 * @param {number} job_id - The ID of the job to retrieve.
 * @returns {Promise<object>} - A Promise that resolves to the job data.
 */
export async function get_job(project_id, job_id) {
  const response = await axios.get(
    `/api/v4/projects/${project_id}/jobs/${job_id}`
  );
  return response.data;
}

/**
 * Retrieves jobs of the latest pipeline for a specific project from GitLab.
 *
 * @param {number} project_id - The ID of the project.
 * @returns {Promise<object>} - A Promise that resolves to the jobs data.
 */
export async function get_jobs_latest(project_id) {
  // get jobs of latest pipeline
  const pipelines = await get_pipelines(project_id, 1, 1);
  if (!pipelines)
    throw new Error(`No pipelines found for project ${project_id}`);

  const jobs = await get_pipeline_jobs(project_id, pipelines[0].id);
  if (!jobs) throw new Error(`No jobs found for pipeline ${pipelines[0].id}`);

  return jobs;
}

/**
 * Retrieves a job by its name for a specific project.
 * Uses the latest pipeline for the project to find the job.
 *
 * @param {number} project_id - The ID of the project.
 * @param {string} job_name - The name of the job.
 * @returns {Promise<object>} - A Promise that resolves to the job data.
 */
export async function get_job_by_name(project_id, job_name) {
  // get jobs of pipeline
  const jobs = await get_jobs_latest(project_id);
  if (!jobs) throw new Error(`No jobs found for pipeline ${pipeline_id}`);

  // find specific job by its name
  const job = jobs.find((j) => j.name === job_name);
  if (!job) throw new Error(`Job with name ${job_name} not found`);
  return job;
}

/**
 * Retrieves a specific artifact for a job in a project from GitLab.
 *
 * @param {number} project_id - The ID of the project the job belongs to.
 * @param {number} job_id - The ID of the job.
 * @param {string} artifact_path - The path of the artifact.
 * @returns {Promise<object>} - A Promise that resolves to the artifact data and path.
 */
export async function get_artifact_by_artifact_path(
  project_id,
  job_id,
  artifact_path
) {
  const response = await axios.get(
    `/api/v4/projects/${project_id}/jobs/${job_id}/artifacts/${artifact_path}`
  );
  return { data: response.data, artifact_path };
}

/**
 * Retrieves all artifacts for a job in a project from GitLab, based on the job name.
 * Uses the **latest pipeline** for the project to find the job.
 *
 * @param {number} project_id - The ID of the project.
 * @param {string} job_name - The name of the job.
 * @returns {Promise<Array>} - A Promise that resolves to an array of artifact data.
 */
export async function get_artifacts_by_job_name(project_id, job_name) {
  // find specific job by its name (latest pipeline)
  const job_data = await get_job_by_name(project_id, job_name);
  if (!job_data) throw new Error(`Job with name ${job_name} not found`);

  // find project in JSON
  const project_json = artifact_paths.projects.find(
    (p) => p.project_id === project_id
  );
  if (!project_json)
    throw new Error(`Project with ID ${project_id} not found in JSON`);

  // find job in JSON
  const job_json = project_json.jobs.find((j) => j.name === job_name);
  if (!job_json) throw new Error(`Job with name ${job_name} not found in JSON`);

  // get artifacts of all jobs
  const artifacts = await Promise.all(
    job_json.artifacts.map((artifact_path) =>
      get_artifact_by_artifact_path(project_id, job_data.id, artifact_path)
    )
  );
  if (!artifacts) throw new Error(`No artifacts found for job ${job_name}`);

  // return data in specific format
  return artifacts.map((art) => {
    return {
      project_id,
      job_name,
      stage: job_data.stage,
      artifact_name: art.artifact_path,
      data: art.data
    };
  });
}

/**
 * Retrieves artifacts for multiple job names.
 *
 * @param {string} project_id - The ID of the project.
 * @param {string[]} job_names - An array of job names.
 * @returns {Promise<Object[]>} An array of artifacts for the specified job names.
 */
export async function get_artifacts_by_job_names(project_id, job_names) {
  const artifacts = [];

  const jobs = await get_jobs_latest(project_id);
  if (!jobs) throw new Error(`No jobs found for pipeline ${pipeline_id}`);

  for (const job_name of job_names) {
    // find specific job by its name
    const job = jobs.find((j) => j.name === job_name);
    if (!job) throw new Error(`Job with name ${job_name} not found`);

    const project_json = artifact_paths.projects.find(
      (p) => p.project_id === project_id
    );
    if (!project_json)
      throw new Error(`Project with ID ${project_id} not found in JSON`);

    const job_json = project_json.jobs.find((j) => j.name === job_name);
    if (!job_json)
      throw new Error(`Job with name ${job_name} not found in JSON`);

    const job_artifacts = await Promise.all(
      job_json.artifacts.map((artifact_path) =>
        get_artifact_by_artifact_path(project_id, job.id, artifact_path)
      )
    );

    artifacts.push(
      ...job_artifacts.map((art) => {
        return {
          project_id,
          job_name,
          stage: job.stage,
          artifact_name: art.artifact_path,
          data: art.data
        };
      })
    );
  }
  return artifacts;
}

/**
 * Retrieves all artifacts for a specific pipeline in a project from GitLab, based on the job name.
 *
 * @param {number} project_id - The ID of the project.
 * @param {number} pipeline_id - The ID of the pipeline.
 * @param {string} job_name - The name of the job.
 * @returns {Promise<Array>} - A Promise that resolves to an array of artifact data.
 */
export async function get_artifacts_by_pipeline_id(
  project_id,
  pipeline_id,
  job_name
) {
  // get jobs of specific pipeline
  const jobs = await get_pipeline_jobs(project_id, pipeline_id);

  // find specific job by its name
  const job = jobs.find((j) => j.name === job_name);
  if (!job) throw new Error(`Job with name ${job_name} not found`);

  // get artifacts of specific job
  return get_artifacts_by_job_name(project_id, job_name);
}

/**
 * Retrieves all names of jobs with reports as artifacts
 *
 * @param {number} project_id - The ID of the project.
 * @returns {Array<String>} - An array of job names.
 */
export function get_job_names_with_reports(project_id) {
  const project_json = artifact_paths.projects.find(
    (p) => p.project_id === project_id
  );
  if (!project_json)
    throw new Error(`Project with ID ${project_id} not found in JSON`);

  return project_json.jobs.filter((j) => j.report).map((j) => j.name);
}
