# These resources are not used. They are created so that I can see outputs.
resource "aws_s3_bucket" "bucket" {
  bucket        = "debug-hatgame-bucket-002"
  acl           = "private"
  force_destroy = false

  versioning {
    enabled = false
  }
}
