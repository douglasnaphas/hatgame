terraform {
  backend "remote" {
    hostname     = "app.terraform.io"
    organization = "hatgame"

    workspaces {
      name = "hatgame-prod-02"
    }
  }
}
