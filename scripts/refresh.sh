#!/bin/bash

ruby scripts/compressor.rb
ruby scripts/make_table.rb
npm run build
