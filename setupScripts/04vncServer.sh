#!/bin/bash
gsettings set org.gnome.Vino enabled true
gsettings set org.gnome.Vino prompt-enabled false
/usr/lib/vino/vino-server
