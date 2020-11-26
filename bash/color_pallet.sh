#!/bin/bash

for i in {0..255}
do
  echo -en "\e[38;05;${i};01m38;05;${i};01m\e[0m"
done

echo
