---
title: "Raspberry Pi Arch Kernel Recovery Notes"
date: "2026-03-24"
updated: "2026-03-24"
description: "Pi 3B Nexus and Pi 5 Master recovery after `linux-rpi 6.18.18-3` upgrade regression"
tags: ["Homelab", "ai-gen"]
---
## Executive summary

Two Raspberry Pi nodes in the homelab failed after upgrading from:

- `linux-rpi 6.12.58-1`
- to `linux-rpi 6.18.18-3`

Observed outcomes:

- **Pi 3B Nexus**: boot failure path involving `systemd-fsck-root.service` and missing `libpcre2-8.so.0`, then black-screen/no-signal behavior after partial recovery
- **Pi 5 Master**: boot/display failure after upgrade, plus stale Wi-Fi service configuration causing long boot delays and no internet uplink

Both nodes were restored by rolling back the kernel to:

- `linux-rpi 6.12.58-1`

Additional corrective actions were also required:

- create `/lib64 -> usr/lib` where missing
- ensure boot artifacts matched the rolled-back kernel
- remove stale `wpa_supplicant@wlan0.service` on Pi 5
- reconfigure Wi-Fi on Pi 5 for the actual interface name `wld0`

## Confirmed working state

### Pi 3B Nexus

- Kernel: `linux-rpi 6.12.58-1`
- Bootloader remained at: `raspberrypi-bootloader 20260319-1`
- `/lib64 -> usr/lib` present
- Node recovered successfully and was reachable over SSH

### Pi 5 Master

- Kernel: `linux-rpi 6.12.58-1`
- Root on NVMe, boot on SD card
- `/lib64 -> usr/lib` added on rootfs
- Wi-Fi uplink restored on `wld0`
- Cluster LAN preserved on `end0`
- Node recovered successfully

## Core findings

## 1. Kernel regression is the primary trigger

Both Pi nodes broke after the same `linux-rpi` upgrade path:

- `6.12.58-1 -> 6.18.18-3`

Both recovered after rollback to:

- `6.12.58-1`

Operational conclusion:

> For this homelab setup, `linux-rpi 6.18.18-3` is currently unsafe.

## 2. Missing `/lib64` compatibility path matters

On both systems, `/lib64` was missing.  
At least one boot-time failure path referenced:

- `/lib64/libpcre2-8.so.0`

The practical fix was:

```bash
ln -s usr/lib /lib64
```

This should be treated as a required compatibility fix on affected nodes.

## 3. Boot layout matters for rollback

### Pi 3B Nexus
- boot and root were both on SD card
- separate boot partition required careful handling in chroot

### Pi 5 Master
- root filesystem on NVMe
- actual boot partition on SD card
- kernel rollback on rootfs alone was not sufficient
- boot artifacts had to be copied from NVMe `/boot` to the real SD boot partition

## 4. Pi 5 network issue was separate from kernel rollback

After recovery, Pi 5 still had:

- long boot delay waiting for `/sys/subsystem/net/devices/wlan0`
- no internet connectivity

Cause:
- Wi-Fi interface had become `wld0`
- stale systemd unit still targeted `wlan0`

Fix:
- disable `wpa_supplicant@wlan0.service`
- enable `wpa_supplicant@wld0.service`
- use networkd config for `wld0`
- keep `end0` as cluster-only static LAN

---

# Recovery procedure

## A. Pi 3B Nexus rollback procedure

## 1. Mount root and boot

```bash
sudo mkdir -p /mnt/pi3-root /mnt/pi3-boot
sudo mount /dev/sda2 /mnt/pi3-root
sudo mount /dev/sda1 /mnt/pi3-boot
```

## 2. Add `/lib64` fix if missing

```bash
sudo ln -s usr/lib /mnt/pi3-root/lib64
```

## 3. Ensure chroot sees the real boot partition

```bash
sudo mount --bind /mnt/pi3-boot /mnt/pi3-root/boot
```

## 4. Bind runtime filesystems

```bash
sudo mount --bind /dev /mnt/pi3-root/dev
sudo mount --bind /proc /mnt/pi3-root/proc
sudo mount --bind /sys /mnt/pi3-root/sys
sudo mount --bind /run /mnt/pi3-root/run
```

## 5. Use foreign-arch chroot via QEMU/binfmt if working from x86_64 host

Typical host prerequisites:

```bash
sudo apt update
sudo apt install qemu-user-static binfmt-support arch-install-scripts
```

Then enter chroot:

```bash
sudo chroot /mnt/pi3-root /bin/bash
```

## 6. Perform local cached kernel rollback

Temporary pacman config with signature checks disabled for offline local package rescue:

```bash
cat >/tmp/pacman-local-nosig.conf <<'EOF'
[options]
RootDir = /
DBPath = /var/lib/pacman/
CacheDir = /var/cache/pacman/pkg/
LogFile = /var/log/pacman.log
GPGDir = /etc/pacman.d/gnupg/
HookDir = /etc/pacman.d/hooks/
Architecture = auto
HoldPkg = pacman glibc
CheckSpace
SigLevel = Never
LocalFileSigLevel = Never

[core]
Server = file:///var/empty

[alarm]
Server = file:///var/empty

[aur]
Server = file:///var/empty
EOF
```

Rollback:

```bash
pacman --config /tmp/pacman-local-nosig.conf -U /var/cache/pacman/pkg/linux-rpi-6.12.58-1-aarch64.pkg.tar.xz
mkinitcpio -P
pacman -Q linux-rpi
```

Expected result:

- `linux-rpi 6.12.58-1`

## 7. Clean unmount

```bash
exit
sudo umount /mnt/pi3-root/run
sudo umount /mnt/pi3-root/sys
sudo umount /mnt/pi3-root/proc
sudo umount /mnt/pi3-root/dev
sudo umount /mnt/pi3-root/boot
sync
sudo umount /mnt/pi3-boot
sudo umount /mnt/pi3-root
```

---

## B. Pi 5 Master rollback procedure

## 1. Mount NVMe rootfs

```bash
sudo mkdir -p /mnt/pi5-root
sudo mount /dev/sda1 /mnt/pi5-root
```

## 2. Add `/lib64` fix if missing

```bash
sudo ln -s usr/lib /mnt/pi5-root/lib64
```

## 3. Bind runtime filesystems

```bash
sudo mount --bind /dev /mnt/pi5-root/dev
sudo mount --bind /proc /mnt/pi5-root/proc
sudo mount --bind /sys /mnt/pi5-root/sys
sudo mount --bind /run /mnt/pi5-root/run
```

## 4. Chroot and rollback kernel

```bash
sudo chroot /mnt/pi5-root /bin/bash
```

Use the same temporary pacman config as above, then:

```bash
pacman --config /tmp/pacman-local-nosig.conf -U /var/cache/pacman/pkg/linux-rpi-6.12.58-1-aarch64.pkg.tar.xz
mkinitcpio -P
pacman -Q linux-rpi
```

## 5. Important Pi 5-specific caveat

On this system, `/etc/fstab` showed:

```fstab
/dev/mmcblk0p1  /boot   vfat    defaults        0       0
PARTUUID=<...>  /       ext4    defaults,noatime 0 1
```

Meaning:

- root is on NVMe
- **real boot is on SD card**

So after rollback, the boot artifacts on the actual SD boot partition had to be updated manually.

## 6. Mount SD boot partition and sync boot artifacts

After plugging in the SD card on the host:

```bash
lsblk -f
```

Then copy the rolled-back boot artifacts from NVMe rootfs `/boot` to the real SD boot partition.

Safe copy set:

- `kernel8.img`
- `initramfs-linux.img`
- all `*.dtb`
- `overlays/`

Intentionally preserve SD card's `cmdline.txt` and `config.txt` unless there is a specific reason to replace them.

Example:

```bash
cp /mnt/pi5-root/boot/kernel8.img /media/<user>/<bootlabel>/
sudo cp /mnt/pi5-root/boot/initramfs-linux.img /media/<user>/<bootlabel>/
sudo cp /mnt/pi5-root/boot/*.dtb /media/<user>/<bootlabel>/
sudo rsync -rltD --delete /mnt/pi5-root/boot/overlays/ /media/<user>/<bootlabel>/overlays/
sync
```

Then unmount cleanly.

---

## C. Pi 5 network recovery procedure

## 1. Remove stale boot-delay Wi-Fi unit

```bash
sudo systemctl disable wpa_supplicant@wlan0.service
sudo systemctl daemon-reload
```

Cause:
- interface had become `wld0`
- systemd was still waiting for `wlan0`

## 2. Keep cluster LAN on ethernet

`end0` should remain static and cluster-only:

```ini
[Match]
Name=end0

[Network]
Address=<...>
```

No default route on `end0`.

## 3. Configure Wi-Fi uplink on `wld0`

Create networkd config:

```ini
# /etc/systemd/network/25-wld0.network
[Match]
Name=wld0

[Network]
DHCP=yes
IPv6AcceptRA=yes
```

Use per-interface wpa_supplicant config:

```bash
sudo cp /etc/wpa_supplicant/wpa_supplicant-wlan0.conf /etc/wpa_supplicant/wpa_supplicant-wld0.conf
sudo systemctl disable --now wpa_supplicant.service
sudo systemctl disable --now wpa_supplicant@wlan0.service
sudo systemctl enable --now wpa_supplicant@wld0.service
sudo systemctl restart systemd-networkd
```

## 4. Verify desired network state

```bash
ip addr show wld0
ip route
networkctl status wld0
```

Healthy expected state:
- `wld0` has DHCP IPv4 address
- default route via Wi-Fi
- `end0` remains cluster-only

---

# System update hygiene for Raspberry Pi Arch nodes

## 1. Do not casually full-upgrade all nodes at once

Use staged rollout:

1. one sacrificial test node
2. one recoverable secondary node
3. only then core nodes

For this lab, that means:
- test first on a non-critical Pi
- keep at least one stable control/reference node untouched

## 2. Record pre-upgrade package state

Before major upgrades:

```bash
pacman -Q > ~/pkglist-before-upgrade.txt
cp /boot/cmdline.txt ~/cmdline-before-upgrade.txt
cp /boot/config.txt ~/config-before-upgrade.txt
```

Also record:

```bash
uname -a
pacman -Q linux-rpi raspberrypi-bootloader
```

## 3. Do not clear pacman cache aggressively

Kernel rollback succeeded because old package files were still available in:

- `/var/cache/pacman/pkg`

Avoid over-cleaning cache on Pi nodes unless you already have a separate rollback plan.

## 4. Pin known-bad packages after recovery

Current recommended pin on recovered nodes:

```ini
IgnorePkg = linux-rpi
```

Only expand this later if evidence shows bootloader or firmware also need pinning.

## 5. Verify boot layout before any kernel work

Always confirm whether `/boot` is:

- part of `/`
- separate SD partition
- separate FAT partition
- separate removable medium

This determines whether a chroot rollback actually updates the real boot files.

Useful checks:

```bash
findmnt /boot
cat /etc/fstab
lsblk -f
```

## 6. Keep boot-policy files deliberate

Do not blindly overwrite these during rescue unless necessary:

- `/boot/cmdline.txt`
- `/boot/config.txt`

These often contain site-specific:
- root device mapping
- console/debug flags
- Pi display/firmware settings

## 7. Remove temporary debug flags after recovery

Example flags that should not be left behind unless intentionally needed:

- `systemd.unit=multi-user.target`
- `systemd.log_level=debug`
- `systemd.log_target=console`

Keep `cmdline.txt` on one line.

## 8. Watch for interface name drift

Do not hardcode `wlan0` blindly.  
Verify actual interface names with:

```bash
ip link
networkctl list
```

If interface-specific services are used, match them to the real interface name.

## 9. Review boot delays after recovery

Use:

```bash
systemd-analyze blame | head -20
systemctl --failed
journalctl -b | tail -100
```

This catches leftover slow boots, stale waits, and post-recovery regressions.

## 10. Keep a minimal offline rescue kit

Recommended host-side tools:

```bash
sudo apt install qemu-user-static binfmt-support arch-install-scripts rsync
```

Useful to have available:
- SD card reader
- USB/NVMe adapter
- spare SD card
- one untouched reference Pi node

---

# Recommended steady-state configuration after this incident

## Pi 3B Nexus
- keep `linux-rpi 6.12.58-1`
- pin kernel with `IgnorePkg = linux-rpi`
- preserve `/lib64 -> usr/lib`

## Pi 5 Master
- keep `linux-rpi 6.12.58-1`
- pin kernel with `IgnorePkg = linux-rpi`
- preserve `/lib64 -> usr/lib`
- keep Wi-Fi on `wld0`
- keep `end0` as cluster-only static LAN
- keep stale `wpa_supplicant@wlan0.service` disabled

---

# Minimal post-recovery verification checklist

Run on each recovered node:

```bash
uname -a
pacman -Q linux-rpi raspberrypi-bootloader
ls -ld /lib64
ip route
systemd-analyze blame | head -15
```

Optional network verification on Wi-Fi nodes:

```bash
networkctl status wld0
ping -c 3 1.1.1.1
ping -c 3 google.com
```

---

# Final operational conclusion

This was not random hardware failure.

The homelab now has a tested incident pattern:

- `linux-rpi 6.18.18-3` broke both Pi 3 and Pi 5 nodes
- rollback to `linux-rpi 6.12.58-1` restored both
- `/lib64 -> usr/lib` was required on affected root filesystems
- Pi 5 additionally needed correction of stale Wi-Fi service binding from `wlan0` to `wld0`

Until upstream confidence improves, treat `linux-rpi 6.18.18-3` as **known-bad for this lab**.
