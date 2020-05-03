terraform {
  backend "remote" {
    hostname     = "app.terraform.io"
    organization = "hatgame"

    workspaces {
      prefix = "hatgame-"
    }
  }
}
