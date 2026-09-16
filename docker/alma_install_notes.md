Alma linux 10.2.  Zabbix (initial build) will require FIPS disabled and old encryption policy.

 

disk 1 (60GB), disk 2 (60 GB), 2 GB RAM.  The disks are artificially small for testing.

 

## Partition

 

# disk 1

 

/boot 768 MiB

/ 8 GiB

/home 4 GiB

/tmp 2 GiB

/var/tmp 2 GiB

/var/log 5 GiB

/var/log/audit 10 GiB

swap 1 GiB

[1/2 RAM]

/var [remaining]

 

# disk 2

 

/var/lib/pgsql/data [remaining]

 

 

## ROOT ACCOUNT. Apply Password and Lock.

 

$ sudo passwd root

New password: 6mt4wzEVh3+9Hv

Retype new password: 6mt4wzEVh3+9Hv

 

$ sudo passwd --status root

root PS 2025-06-18 0 99999 7 -1 (Password set, SHA512 crypt.)

 

$ sudo passwd --lock root

Locking password for user root.

passwd: Success

 

$ sudo passwd --status root

root LK 2025-06-18 0 99999 7 -1 (Password locked.)

 

 

## REMOVE UNNECESSARY RPMS

 

// remove wireless drivers before you update linux rpms

$ sudo dnf -y autoremove iwl*

 

 

## CONFIGURE REPO (if required) AND UPDATE

 

For AlmaLinux 10,

$ sudo rpm --import /etc/pki/rpm-gpg/RPM-GPG-KEY-AlmaLinux-10

 

$ sudo dnf update

$ sudo reboot

 

// following reboot, remove old kernels after you update linux rpms

$ sudo dnf -y remove linux-firmware

$ sudo dnf -y remove -y $(dnf repoquery --installonly --latest-limit=-1 -q)

 

 

// ADDITIONAL REPOS

 

$ sudo dnf install https://repo.zabbix.com/zabbix/7.4/release/alma/10/noarch/zabbix-release-latest-7.4.el10.noarch.rpm

 

 

 

// ADDITIONAL RPMS

 

$ sudo dnf install rsyslog-gnutls rng-tools

 

$ sudo dnf install openscap-scanner scap-security-guide

 

$ sudo dnf install zabbix-server-pgsql \

zabbix-web-pgsql \

zabbix-nginx-conf \

zabbix-sql-scripts \

zabbix-selinux-policy \

zabbix-agent

 

 

## Finding SCAP Content and Profiles

AlmaLinux 9 OpenSCAP Guide | AlmaLinux Wiki

https://ncp.nist.gov/repository

 

 

Locate data streams: Find the datastream XML files in

/usr/share/xml/scap/ssg/content/

 

List profiles: Run to see all supported security profiles.

 

$ sudo oscap info /usr/share/xml/scap/ssg/content/ssg-almalinux10-ds.xml

 

For more information about a profile.

 

$ sudo oscap info /usr/share/xml/scap/ssg/content/ssg-almalinux10-ds.xml | grep -i standard

 

The Enterprise Baseline profile (commonly known as the Standard System Security Profile or a corporate baseline) focuses on standard, non-government-specific security hardening for general production servers.

Profile: xccdf_org.ssgproject.content_profile_standard

 

 

export $Id=xccdf_org.ssgproject.content_profile_standard

 

$ oscap info --profile $Id /usr/share/xml/scap/ssg/content/ssg-almalinux10-ds.xml

[use --fetch-remote-resources to download missing OVAL definitions]

 

Running an Audit Scan

 

Execute evaluation: Run a compliance scan locally using a specific profile ID:

 

$ sudo oscap xccdf eval --profile $Id --results /tmp/results.xml --report report.html /usr/share/xml/scap/ssg/content/ssg-almalinux10-ds.xml

 

$ sudo oscap xccdf eval \

--profile $Id \ 

--results /tmp/results.xml \

--report report.html \

--fetch-remote-resources \

/usr/share/xml/scap/ssg/content/ssg-almalinux10-ds.xml

 

Remediation: Add --remediate to the command if you want OpenSCAP to automatically attempt fixing non-compliant settings.

 

$ sudo oscap xccdf eval --profile $Id --remediate /usr/share/xml/scap/ssg/content/ssg-almalinux10-ds.xml

 

Generating a Full Security Guide

 

$ sudo oscap xccdf generate guide \

--profile $$Id  \

--fetch-remote-resources \

/usr/share/xml/scap/ssg/content/ssg-almalinux10-ds.xml > $HOME/security_guide.html

 

Generate remediation scripts

 

$ sudo oscap xccdf generate fix --profile $Id --fix-type bash \

--output all-remediations.sh /usr/share/xml/scap/ssg/content/ssg-almalinux10-ds.xml

 

To generate a remediation script with specific remediations run a scan against an XCCDF file and use an XML results file:

 

$ sudo oscap xccdf generate fix \

--profile $Id \

--fix-type bash  \

--output remediations.sh /tmp/results.xml

 

REF:

GitHub - AlmaLinux/infra-ansible: AlmaLinux infrastructure Ansible playbooks and roles

Google search "scap profile alma linux 10"

 

$ sudo oscap xccdf eval \

 --profile xccdf_org.ssgproject.content_profile_standard \

 --results /tmp/results.xml \

 --report report.html \

 /usr/share/xml/scap/ssg/content/ssg-almalinux10-ds.xml

 

Remediate

 

$ sudo oscap xccdf eval \

 --profile xccdf_org.ssgproject.content_profile_standard \

 --remediate \

 --results /tmp/remediated_results.xml \

 --report remediated_report.html \

 /usr/share/xml/scap/ssg/content/ssg-almalinux10-ds.xml

 

To apply remediation with exceptions, you use an XCCDF Tailoring File. A tailoring file acts as a custom layer that extends the base profile to unselect (exclude) specific rules from executing or remediating.

 

If you don't know the exact rule ID to exclude, you can search the data stream for relevant keywords (e.g., ssh, password, firewalld) using grep:

 

$ grep -oE 'id="xccdf_org.ssgproject.content_rule_[^"]+"' /usr/share/xml/scap/ssg/content/ssg-almalinux10-ds.xml | grep -i "ssh"

 

Run the Scan & Remediation with the Tailoring File

 

sudo oscap xccdf eval \

 --tailoring-file tailoring.xml \

 --profile xccdf_org.ssgproject.content_profile_standard \

 --remediate \

 --results tailored_remediation_results.xml \

 --report tailored_remediation_report.html \

 /usr/share/xml/scap/ssg/content/ssg-almalinux10-ds.xml

 

Example

 

To bypass the standard compliance checks and avoid changing your existing active rules during remediation, exclude rules from execution. Add the following <xccdf:select> exception tags to your custom enterprise_tailoring.xml file:

 

<?xml version="1.0" encoding="UTF-8"?>

<xccdf:Tailoring xmlns:xccdf="National Institute of Standards and Technology" id="xccdf_custom_tailoring_file">

 <xccdf:benchmark href="/usr/share/xml/scap/ssg/content/ssg-almalinux10-ds.xml"/>

 

 <xccdf:Profile id="xccdf_org.ssgproject.content_profile_standard_customized" extends="xccdf_org.ssgproject.content_profile_standard">

   <xccdf:title xml:lang="en">Enterprise Baseline with Firewall Exceptions</xccdf:title>

   <xccdf:description xml:lang="en">Applies corporate baseline hardening while skipping firewall modifications.</xccdf:description>

   

   <!-- EXTREMELY IMPORTANT: Excludes firewalld daemon enforcement -->

   <xccdf:select idref="xccdf_org.ssgproject.content_rule_service_firewalld_enabled" selected="false"/>

   

   <!-- Excludes enforcing default zoning changes -->

   <xccdf:select idref="xccdf_org.ssgproject.content_rule_set_firewalld_default_zone" selected="false"/>

   

 </xccdf:Profile>

</xccdf:Tailoring>