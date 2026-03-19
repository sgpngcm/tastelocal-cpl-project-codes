from .settings import *  # noqa
from pathlib import Path
import tempfile


class DisableMigrations(dict):
    def __contains__(self, item):
        return True

    def __getitem__(self, item):
        return None


DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}

MIGRATION_MODULES = DisableMigrations()
PASSWORD_HASHERS = ['django.contrib.auth.hashers.MD5PasswordHasher']
EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'
MEDIA_ROOT = Path(tempfile.gettempdir()) / 'tastelocal_test_media'
DEFAULT_FILE_STORAGE = 'django.core.files.storage.FileSystemStorage'
GOOGLE_MAPS_API_KEY = 'test-google-key'
