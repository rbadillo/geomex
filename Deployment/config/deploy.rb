default_run_options[:pty] = true  # Must be set for the password prompt from git to work

set :normalize_asset_timestamps, false
set :scm, "git"
set :scm_username, "rbadillo" # Git User 
set :scm_passphrase, "b3t0SaTuRn01"  # Git User password
set :repository, "https://rbadillo:b3t0SaTuRn01@github.com/rbadillo/geomex.git"  # Your clone URL
set :branch, "2.0.0"

set :user, "geomex"  # The server's user for deploys
set :password, "EstaTrivialBox!"  # The server's user for deploys
set :deploy_to, "/home/geomex/Near"
set :use_sudo, false
role :geomex_server, "192.168.0.16", :primary => true

namespace :geomex do
  desc "Instalando Nodejs Dependencies"
  task :NodejsDependencies do
    run "echo 'EstaTrivialBox!' | sudo -S #{latest_release}/Src/Node/SetupNodejs.sh > /dev/null 2>&1" 
  end
  task :RabbitMQDependencies do
    run "echo 'EstaTrivialBox!' | sudo -S #{latest_release}/Src/Node/SetupRabbitMQ.sh > /dev/null 2>&1" 
  end
  desc "Stop Forever Processes"
  task :StopForever do
    run "forever stopall" 
  end
  desc "Stop Forever Root Processes"
  task :StopForeverRoot do
    run "echo 'EstaTrivialBox!' | sudo -S forever stopall" 
  end
  desc "Iniciando Router Server"
  task :RouterServer do
    run "cd #{current_path}/Src/Node && echo 'EstaTrivialBox!' | sudo -S forever start -a -l /home/geomex/Logs/RouterServer.log RouterServer.js" 
  end
  desc "Iniciando Register Server"
  task :RegisterServer do
    run "cd #{current_path}/Src/Node && forever start -a -l /home/geomex/Logs/RegisterServer.log RegisterServer.js" 
  end
  desc "Iniciando QueueWorker Server"
  task :MessagingServer do
    run "cd #{current_path}/Src/Node && forever start -a -l /home/geomex/Logs/MessagingServer.log MessagingServer.js" 
  end
  desc "Iniciando MsgDispatcher"
  task :MsgDispatcher do
    run "cd #{current_path}/Src/Node && forever start -a -l /home/geomex/Logs/MsgDispatcher.log MsgDispatcher.js" 
  end
  desc "Iniciando FeatureServer"
  task :FeatureServer do
    run "cd #{current_path}/Src/Node && forever start -a -l /home/geomex/Logs/FeatureServer.log FeatureServer.js" 
  end
  desc "Iniciando OfferServer"
  task :OfferServer do
    run "cd #{current_path}/Src/Node && forever start -a -l /home/geomex/Logs/OfferServer.log OfferServer.js" 
  end
  desc "Iniciando ReportServer"
  task :ReportServer do
    run "cd #{current_path}/Reports && forever start -a -l /home/geomex/Logs/ReportServer.log ReportServer.js" 
  end
  desc "Instalando Crontab"
  task :InstallingCrontab do
    run "cd #{current_path}/Utilities && crontab -u geomex crontab.txt" 
  end
    desc "Configurando Haproxy"
  task :ConfiguringHaproxy do
    run "cd #{current_path}/Deployment/haproxy && echo 'EstaTrivialBox!' | sudo -S cp haproxy.cfg /etc/haproxy/ && echo 'EstaTrivialBox!' | sudo -S service haproxy restart" 
  end
 end

after "deploy" ,
 "geomex:NodejsDependencies",
 "geomex:RabbitMQDependencies",
 "geomex:StopForever",
 "geomex:StopForeverRoot",
 "geomex:RegisterServer" , "geomex:MessagingServer" , "geomex:MsgDispatcher",
 "geomex:FeatureServer" , "geomex:OfferServer" , "geomex:ReportServer" , "geomex:InstallingCrontab",
 "geomex:ConfiguringHaproxy"

