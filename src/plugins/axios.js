import axios from "axios";

// No reason to put this in .env files, they get put in
// the final build anyway. Only way to fix this
// is to use a backend/middleware to handle the secrets.
const token = "zr3UWe1nomsrF1wQoq7S";

export default axios.create({
  baseURL: "https://lv-gitlab.intern.th-ab.de/",
  headers: {
    Authorization: `Bearer ${token}`
  }
});
