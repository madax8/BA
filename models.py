from flask_sqlalchemy import SQLAlchemy
from __init__ import db


# Modemdaten
class Modem(db.Model):

    __tablename__ = "modems"

    id = db.Column(db.Integer, primary_key=True)
    modelname = db.Column(db.String(80), unique=True)
    wert = db.Column(db.String(120), unique=True)
    coord1 = db.Column(db.String(20), unique=False)
    coord2 = db.Column(db.String(20), unique=False)

    def __init__(self, modelname, wert, coord1, coord2):
        self.modelname = modelname
        self.wert = wert
        self.coord1 = coord1
        self.coord2 = coord2

    def __repr__(self):
        return '<Modem %r>' % self.modelname


# db für geocordinaten
class Geo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    geoaddress = db.Column(db.String(80), unique=False)
    geocoord = db.Column(db.geography(POINT), unique=False)

    def __init__(self, geoaddress, geocoord):
        self.geoaddress = geoaddress
        self.geocoord = geocoord

    def __repr__(self):
        return '<Geo %r>' % self.geoaddress


