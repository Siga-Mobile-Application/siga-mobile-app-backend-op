locals {
  source_get_data_user = "../build/lambdas/get-data-user.zip"
}

resource "aws_s3_object" "get_data_user" {
  key    = "build/get-data-user.zip"
  bucket = aws_s3_bucket.bucket.id
  source = local.source_get_data_user
  etag   = filebase64sha256(local.source_get_data_user)
}

resource "aws_lambda_function" "get_data_user" {
  source_code_hash = filebase64sha256(local.source_get_data_user)
  s3_bucket        = aws_s3_bucket.bucket.id
  s3_key           = aws_s3_object.get_data_user.key
  function_name    = "${local.app_name}-${var.environment}-get-data"
  role             = data.aws_iam_role.lambda-role.arn
  handler          = "index.handler"
  runtime          = "nodejs20.x"
}
