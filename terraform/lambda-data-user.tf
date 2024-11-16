locals {
  source_get_data_user = "../build/lambdas/hello-world.zip"
}

resource "aws_s3_object" "lambda_user" {
  key    = "build/hello.zip"
  bucket = aws_s3_bucket.bucket.id
  source = local.source_get_data_user
}

resource "aws_lambda_function" "hello_word" {
  source_code_hash = filebase64sha256(local.source_get_data_user)
  s3_bucket = aws_s3_bucket.bucket.id
  s3_key = aws_s3_object.lambda_user.key
  function_name = "${local.app_name}-hello-word"
  role = data.aws_iam_role.lambda-role.arn
  handler = "index.handler"
  runtime = "nodejs20.x"
}