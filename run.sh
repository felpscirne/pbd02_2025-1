#!/bin/bash
# start.sh
(cd garciaTec && npm run dev) &
(cd back && flask run)
