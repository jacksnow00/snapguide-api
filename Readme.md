## Getting Started

Assuming you already have bundler installed (otherwise, `gem install
bundler`), run the following commands:

```bash
  cp Procfile.template Procfile
  bundle
  foreman start
```

Note: this project was tested with ruby 1.9.3

### Run the integration tests

```bash
  bundle exec rspec spec
```
