Name:           collectd-cgp-frontend
Version:        0.4
Release:        1%{?dist}
Summary:        A web frontend for collectd and rrdtool

Group:          Applications/Internet
License:        GPL
URL:            https://github.com/pommi/CGP

Source0:        %{name}-%{version}.tar.gz

BuildRoot:      %{_tmppath}/%{name}-%{version}-%{release}-root-%(%{__id_u} -n)

BuildArch:     noarch
Requires:      php >= 5.0 collectd collectd-rrdtool


%description
This package installs the necessary application files to run a CGP collectd web frontend 

%prep
%setup -c -n collectd-cgp-frontend 

%build

%install
rm -rf $RPM_BUILD_ROOT
mkdir -p $RPM_BUILD_ROOT/usr/share/collectd/CGP
tar -c --exclude SPEC --exclude .git . | tar -x -C $RPM_BUILD_ROOT/usr/share/collectd/

%pre

%post

%clean
rm -rf $RPM_BUILD_ROOT

%files
%defattr(-, root, root)
/usr/share/collectd/CGP/

%changelog
* Thu Sep 10 2015 Nick Jackson <n.jackson@cpanel.net> - 0.4-1 
- Package CGP based on current master in Github
