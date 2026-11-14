[frontend]
frontend-node ansible_host=${frontend_public_ip} ansible_user=${ssh_user} ansible_ssh_private_key_file=${ssh_private_key}

[backend]
backend-node ansible_host=${backend_private_ip} ansible_user=${ssh_user} ansible_ssh_private_key_file=${ssh_private_key} ansible_ssh_common_args='-o ProxyCommand="ssh -W %h:%p -q ${ssh_user}@${frontend_public_ip} -i ${ssh_private_key}"'

[database]
db-node ansible_host=${db_private_ip} ansible_user=${ssh_user} ansible_ssh_private_key_file=${ssh_private_key} ansible_ssh_common_args='-o ProxyCommand="ssh -W %h:%p -q ${ssh_user}@${frontend_public_ip} -i ${ssh_private_key}"'

[all:vars]
tenant_id=${tenant_id}
ansible_python_interpreter=/usr/bin/python3
environment=${environment}
