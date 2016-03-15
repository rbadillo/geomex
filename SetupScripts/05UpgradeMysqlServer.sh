sudo apt-get remove -y mysql-server
sudo apt-get autoremove -y
wget https://dev.mysql.com/get/mysql-apt-config_0.3.3-2ubuntu12.04_all.deb
sudo dpkg -i mysql-apt-config*.deb
echo "deb http://repo.mysql.com/apt/ubuntu/ precise mysql-apt-config
deb http://repo.mysql.com/apt/ubuntu/ precise mysql-5.6" | sudo tee /etc/apt/sources.list.d/mysql.list
curl -s http://ronaldbradford.com/mysql/mysql.gpg | sudo apt-key add -
sudo apt-get update
apt-cache show mysql-server
sudo apt-get install -y mysql-server
sudo mysql_upgrade -uroot -p
sudo rm -f /etc/mysql/conf.d/mysqld_safe_syslog.cnf
sudo sed -ie "s/^key_buffer[^_]/key_buffer_size/" /etc/mysql/my.cnf
sudo sed -ie "s/^myisam-recover[^-]/myisam-recover-options/" /etc/mysql/my.cnf