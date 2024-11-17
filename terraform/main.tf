resource "aws_s3_bucket" "bucket" {
  bucket = var.bucket_name
  force_destroy = true
}

resource "aws_s3_object" "dist" {
  for_each = fileset("../s3/", "**/*")

  bucket = aws_s3_bucket.bucket.id
  key    = each.value
  source = "../s3/${each.value}"
  etag   = filemd5("../s3/${each.value}")
  content_type = "application/json"
}

data "aws_iam_role" "lambda-role" {
  name = "siga-app-lambda-role"
}
