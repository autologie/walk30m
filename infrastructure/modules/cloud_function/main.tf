variable "bucket_name" {
  type = "string"
}

variable "function_name" {
  type = "string"
}

variable "source_dir" {
  type = "string"
}

data archive_file "function_source" {
  type        = "zip"
  source_dir  = "${var.source_dir}"
  output_path = "./staging/${var.function_name}.zip"
}

resource google_storage_bucket_object "function_assets" {
  name   = "function_assets/${var.function_name}.zip"
  source = "${data.archive_file.function_source.output_path}"
  bucket = "${var.bucket_name}"
}

resource google_cloudfunctions_function "http_function" {
  name                  = "${var.function_name}"
  region                = "us-central1"
  source_archive_bucket = "${var.bucket_name}"
  source_archive_object = "${google_storage_bucket_object.function_assets.name}"
  trigger_http          = "true"
}
