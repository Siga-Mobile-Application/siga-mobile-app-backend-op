resource "aws_s3_bucket" "bucket" {
  bucket = var.bucket_name
}

data "aws_iam_role" "lambda-role" {
  name = "siga-app-lambda-role"
}