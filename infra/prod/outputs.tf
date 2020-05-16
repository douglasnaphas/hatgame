output "acm_distinct_domain_names" {
  # value = module.acm.aws_acm_certificate.this
  value = module.acm.distinct_domain_names
}

output "acm_this_acm_certificate_arn" {
  value = module.acm.this_acm_certificate_arn
}

output "acm_this_acm_certificate_domain_validation_options" {
  value = module.acm.this_acm_certificate_domain_validation_options
}

output "acm_validation_domains" {
  value = module.acm.validation_domains
}

output "acm_validation_route53_record_fqdns" {
  value = module.acm.validation_route53_record_fqdns
}
