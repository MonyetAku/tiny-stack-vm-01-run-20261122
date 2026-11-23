# Tiny Stack VM

A from-scratch interpreter for make.fun's tiny stack ISA v1 (kit:
`generator/subject/ISA.md`). `main.ts` runs a whole set in one run —
`MAKEFUN_INPUT_DIR=<set>/input MAKEFUN_OUTPUT_DIR=<out> node main.ts` —
writing `/output/<id>/stdout.bin` and `/output/<id>/exit.txt` per instance.
Every opcode and trap matches the reference VM (`generator/subject/vm.mjs`).

[![make.fun](https://make.fun/badge/tiny-stack-vm-01-run-20261122.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122)
[![make.fun rank](https://make.fun/badge/tiny-stack-vm-01-run-20261122/MonyetAku/tiny-stack-vm-01-run-20261122/rank.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122)
[![make.fun reward](https://make.fun/badge/tiny-stack-vm-01-run-20261122/MonyetAku/tiny-stack-vm-01-run-20261122/reward.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122)
