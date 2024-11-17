resource "aws_api_gateway_rest_api" "apigateway" {
    name = ""
    body = jsondecode({
        openapi: "3.0.1"
        info = {
            title = "siga-app-requests-api",
            version = "1.0"
        }
        paths = {
            ("/data") = {
                get = {
                    responses = {
                        "200" = {
                            description = "200 response"
                            content = {}
                        }
                    }
                    x-amazon-apigateway-integration = {
                        type = "aws_proxy"
                        httpMethod = "GET"
                        uri = "${aws_lambda_function.get_data_user.invoke_arn}"
                    }
                }
            }
        }
    })
}