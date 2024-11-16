# resource "aws_api_gateway_rest_api" "example" {
#   name = "${var.environment}-siga-app-api"
#   body = jsondecode({
#     openapi = "3.0.1"
#     info = {
#       title = "${var.environment}siga-app-api"
#     }
#     paths = {
#       ("/data") = {
#         get = {
#           responses = {
#             "200" = {
#               description = "200 response"
#               content     = {}
#             }
#           }
#         }
#       }
#     }
#   })
# }
