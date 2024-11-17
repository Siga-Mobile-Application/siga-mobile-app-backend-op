resource "aws_apigatewayv2_api" "apigateway-lambda" {
  name          = "${local.app_name}-${var.environment}-api"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_stage" "apigateway-lambda" {
  api_id = aws_apigatewayv2_api.apigateway-lambda.id

  name        = "${local.app_name}-${var.environment}"
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_log_group.arn

    format = jsonencode({
      status                  = "$context.status"
      requestId               = "$context.requestId"
      sourceIp                = "$context.identity.sourceIp"
      requestTime             = "$context.requestTime"
      protocol                = "$context.protocol"
      httpMethod              = "$context.httpMethod"
      resourcePath            = "$context.resourcePath"
      routeKey                = "$context.routeKey"
      responseLength          = "$context.responseLength"
      integrationErrorMessage = "$context.integrationErrorMessage"
      }
    )
  }
}

resource "aws_apigatewayv2_integration" "get_data_user" {
  api_id = aws_apigatewayv2_api.apigateway-lambda.id

  integration_uri    = aws_lambda_function.get_data_user.invoke_arn
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
}

resource "aws_apigatewayv2_route" "get_data_user" {
  api_id = aws_apigatewayv2_api.apigateway-lambda.id

  route_key = "GET /data"
  target    = "integrations/${aws_apigatewayv2_integration.get_data_user.id}"
  request_parameter {
    request_parameter_key = "action"
    required = true
  }
}

resource "aws_cloudwatch_log_group" "api_log_group" {
  name = "/aws/api_log_grup/${aws_apigatewayv2_api.apigateway-lambda.name}"

  retention_in_days = 1
}

resource "aws_lambda_permission" "get_data_user_policy" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_data_user.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.apigateway-lambda.execution_arn}/*/*"
}