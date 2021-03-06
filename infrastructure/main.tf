variable "gcp_project_id" {
  type = "string"
}

variable "backend_deploy_bucket_name" {
  type = "string"
}

provider "google" {
  project = "${var.gcp_project_id}"
}

resource google_storage_bucket "backend_deploy_bucket" {
  name          = "${var.backend_deploy_bucket_name}"
  location      = "us-central1"
  storage_class = "REGIONAL"
}

module "execution_logs_api" {
  source = "modules/cloud_function"

  bucket_name   = "${google_storage_bucket.backend_deploy_bucket.name}"
  function_name = "executionLogs"
  source_dir    = "../backend/execution-logs"
}

module "users_api" {
  source = "modules/cloud_function"

  bucket_name   = "${google_storage_bucket.backend_deploy_bucket.name}"
  function_name = "users"
  source_dir    = "../backend/users"
}
