module "s3-cf-site" {
  source  = "douglasnaphas/s3-cf-site/aws"
  version = "0.3.0"
  # insert the 5 required variables here
  bucket_name = var.bucket_name
  cert_domain = var.cert_domain
  ci_user_arn = var.ci_user_arn
  domain_name = var.domain_name
  zone_name   = var.zone_name
}
