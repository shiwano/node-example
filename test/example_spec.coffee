require 'should'

example = require "../src/example.coffee"

describe 'example', ->
  it 'main', ->
    example.main().should.equal 'example'
