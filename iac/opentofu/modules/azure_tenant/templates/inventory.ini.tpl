# ==============================================================================
# Inventario Dinamico de Ansible generado por OpenTofu
# Tenant: ${tenant_id} | Entorno: ${environment}
# ==============================================================================

[frontend]
frontend-node ansible_host=${frontend_public_ip} ansible_user=${ssh_user} ansible_ssh_private_key_file=${ssh_private_key}

[backend]
backend-node ansible_host=${backend_private_ip} ansible_user=${ssh_user} ansible_ssh_private_key_file=${ssh_private_key} ansible_ssh_common_args='-o ProxyCommand="ssh -W %h:%p -q ${ssh_user}@${frontend_public_ip} -i ${ssh_private_key} -o StrictHostKeyChecking=no"'

[database]
db-node ansible_host=${db_private_ip} ansible_user=${ssh_user} ansible_ssh_private_key_file=${ssh_private_key} ansible_ssh_common_args='-o ProxyCommand="ssh -W %h:%p -q ${ssh_user}@${frontend_public_ip} -i ${ssh_private_key} -o StrictHostKeyChecking=no"'

[all:vars]
tenant_id=${tenant_id}
environment=${environment}
ansible_python_interpreter=/usr/bin/python3
ansible_ssh_extra_args='-o StrictHostKeyChecking=no'
