package play.security

default allow = false

# Allow deployments only if the image tag is NOT 'latest'
allow {
    input.image
    not contains(input.image, ":latest")
}
