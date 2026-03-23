#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys


def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'server.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    
    # Check if running runserver without a port specified
    if len(sys.argv) >= 2 and sys.argv[1] == 'runserver':
        if len(sys.argv) == 2:  # Just "python manage.py runserver"
            sys.argv.append('8080')  # Add port 8080 as default
        elif len(sys.argv) == 3 and sys.argv[2].isdigit():  # If a port number is provided
            pass  # Use whatever port they specified
        # If they added other args like --noreload, don't modify
    
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()