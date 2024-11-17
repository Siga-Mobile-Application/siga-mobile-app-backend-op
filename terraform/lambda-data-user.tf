locals {
  source_get_data_user = "../build/lambdas/hello-world.zip"
}

resource "aws_s3_object" "lambda_user" {
  key    = "build/hello.zip"
  bucket = aws_s3_bucket.bucket.id
  source = local.source_get_data_user
  etag = filebase64sha256("../build/lambdas/hello.zip")
}

resource "aws_lambda_function" "hello_word" {
  source_code_hash = filebase64sha256("../build/lambdas/hello.zip")
  s3_bucket = aws_s3_bucket.bucket.id
  s3_key = aws_s3_object.lambda_user.key
  function_name = "${local.app_name}-${var.environment}-hello-word"
  role = data.aws_iam_role.lambda-role.arn
  handler = "index.handler"
  runtime = "nodejs20.x"
}