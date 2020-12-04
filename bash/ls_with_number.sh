#!/bin/bash

ls_with_line_number() {
  local line_num=0
  while read -r line
  do
    line_num=$((line_num+1))
    echo "${line_num}: ${line}"
  done < <(ls)
}

ls_with_line_number
