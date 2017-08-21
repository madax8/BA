from __init__ import db
from models import Modem
# from models import Geo


# create the database
db.create_all()


# insert data
modem1 = Modem('Innstraße 25', '15', '12.13213', '47.85488')
modem2 = Modem('Am Innreit 2', '3', '12.132373', '47.855533')
db.session.add(modem1)
db.session.add(modem2)

# commit the changes
db.session.commit()

