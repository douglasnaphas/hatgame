variable "bucket_name" {
  description = "Name of the S3 bucket that will hold the site's static assets"
  type        = string
}

variable "cert_domain" {
  description = "The cert_domain input for douglasnaphas/s3-cf-site/aws"
  type        = string
}

variable "ci_user_arn" {
  description = "The ci_user_arn input for douglasnaphas/s3-cf-site/aws"
  type        = string
}

variable "domain_name" {
  description = "The domain_name input for douglasnaphas/s3-cf-site/aws"
  type        = string
}

variable "zone_name" {
  description = "The zone_name input for douglasnaphas/s3-cf-site/aws"
  type        = string
}
