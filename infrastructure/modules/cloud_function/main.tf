variable "bucket_name" {
  type = "string"
}

variable "function_name" {
  type = "string"
}

variable "source_dir" {
  type = "string"
}

resource null_resource "function_source" {
  triggers = {
    always_run = "${uuid()}"
  }

  provisioner "local-exec" {
    command = "./modules/cloud_function/create_archive.sh ${var.source_dir} ./staging/${var.function_name}.zip"
  }
}

resource google_storage_bucket_object "function_assets" {
  depends_on = ["null_resource.function_source"]
  name       = "function_assets/${var.function_name}.zip"
  source     = "./staging/${var.function_name}.zip"
  bucket     = "${var.bucket_name}"
}

resource google_cloudfunctions_function "http_function" {
  depends_on            = ["google_storage_bucket_object.function_assets"]
  name                  = "${var.function_name}"
  region                = "us-central1"
  source_archive_bucket = "${var.bucket_name}"
  source_archive_object = "${google_storage_bucket_object.function_assets.name}"
  trigger_http          = "true"
}
