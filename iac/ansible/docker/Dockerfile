FROM python:3.11-slim

# Instalar dependencias del sistema requeridas para SSH, compilación y PostgreSQL
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssh-client \
    sshpass \
    curl \
    git \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Instalar Ansible y dependencias de PostgreSQL
RUN pip install --no-cache-dir \
    ansible \
    psycopg2-binary

# Instalar colecciones requeridas de Ansible
RUN ansible-galaxy collection install community.postgresql

WORKDIR /ansible

CMD ["ansible-playbook", "--version"]
