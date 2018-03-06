from flask import Flask
from flask import render_template
from flask import request, flash, url_for, redirect
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func
from flask import json
import requests
import json
import os
import time

# geocoding
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut


# hoeherer timeout kann zu einer Performanceerhoehung fuehren
# da dadurch weniger exceptions zustande kommen
# bei eigener Nominatim implementierung sollte er moeglichst niedrig sein
geolocator = Nominatim(timeout=5)

app = Flask(__name__, static_url_path='/static')
POSTGRES = {
    'user': 'postgres',
    'pw': 'a1b2c3',
    'db': 'postgres',
    'host': 'localhost',
    'port': '5432',
}
# app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://%(user)s:\%(pw)s@%(host)s:%(port)s/%(db)s' % POSTGRES
app.config['SQLALCHEMY_DATABASE_URI'] = "postgresql://postgres:a1b2c3@localhost/modemdb"
app.config['SECRET_KEY'] = "random string"
app.config['DEBUG'] = True
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Adresse
class address(db.Model):
    __tablename__ = "address"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(40), unique=False)
    street = db.Column(db.String(60))
    number = db.Column(db.String(8))
    plz = db.Column(db.Integer)
    city = db.Column(db.String(40))
    mac = db.Column(db.String(20), unique=True)

    def __init__(self, name, street, number, plz, city, mac):
        self.name = name
        self.street = street
        self.number = number
        self.plz = plz
        self.city = city
        self.mac = mac


# Modemdaten
class modems(db.Model):

    __tablename__ = "modems"

    id = db.Column(db.Integer, primary_key=True)
    mac = db.Column(db.String(20), unique=True)
    modelname = db.Column(db.String(80), unique=False)
    wert = db.Column(db.String(120), unique=False)
    status = db.Column(db.String(20), unique=False)

    def __init__(self, modelname, mac, wert, status):
        self.modelname = modelname
        self.mac = mac
        self.wert = wert
        self.status = status

    def __repr__(self):
        return '<Modem %r>' % self.modelname


class geoj(db.Model):

    __tablename__ = "geoj"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, unique=True)
    jsondata = db.Column(db.JSON)

    def __init__(self, name, jsondata):
        self.name = name
        self.jsondata = jsondata


# Muss noch angepasst werden
class mapAddress(db.Model):

    __tablename__ = "mapAddress"

    id = db.Column(db.Integer, primary_key=True)
    address = db.Column(db.String, unique=True)
    lat = db.Column(db.Float)
    lon = db.Column(db.Float)

    def __init__(self, address, lat, lon):
        self.address = address
        self.lat = lat
        self.lon = lon


db.create_all()


# Startseite
@app.route('/')
def index():
    return render_template('index.html', geoj=geoj.query.all())


@app.route('/map/<name>')
def show_map_dynamic(name):
    return render_template('leaflet.html', jsonName=name)


# Modems anzeigen
@app.route('/all')
def show_all():
    return render_template('show_all.html', modems=modems.query.all())


@app.route('/geocode')
def geocode():
    return render_template('geocode.html', geocodes=mapAddress.query.all())


# Adressview anzeigen
@app.route('/address')
def show_address():
    return render_template('address.html', address=address.query.all())


# neue Modems
@app.route('/new', methods=['GET', 'POST'])
def new():
    if request.method == 'POST':
        if not request.form['modelname'] or not request.form['wert'] \
                                         or not request.form['status']:
            flash('Please enter all the fields', 'error')
        else:
            modem = modems(request.form['modelname'], request.form['mac'], request.form['wert'],
                               request.form['status'])

            db.session.add(modem)
            db.session.commit()

            flash('Record was successfully added')
            return redirect(url_for('show_all'))
    return render_template('new.html')


# neue Adressen
@app.route('/new_address', methods=['GET', 'POST'])
def new_address():
    if request.method == 'POST':
        if not request.form['name'] or not request.form['street'] \
                or not request.form['number'] \
                or not request.form['plz'] or not request.form['city'] \
                or not request.form['mac']:
            flash('Please enter all the fields', 'error')
        else:
            addr = address(request.form['name'], request.form['street'],
                           request.form['number'], request.form['plz'],
                           request.form['city'], request.form['mac'])

            db.session.add(addr)
            db.session.commit()

            flash('Record was successfully added')
            return redirect(url_for('show_address'))
    return render_template('new_address.html')


def save_json(name, geojson):
    save = geoj(name, geojson)
    db.session.add(save)
    db.session.commit()


@app.route('/geojson')
def show_geojson():
    return render_template('geojson.html', geoj=geoj.query.all())


# render leaflet-view ohne Daten
@app.route('/leaflet')
def show_leaflet():
    return render_template('leaflet.html')


# joint die beiden DBs ueber die macadresse
# und speichert das Ergebniss als geojson
@app.route('/create/<name>')
def create_geojson(name):
    j = (db.session.query(modems, address)).filter(modems.mac == address.mac)
    save_json(name, convert_json(j))
    return "Erfolgreich!"
    # save_json(name, convert_json(arr))
    #
    # with open('static/' + name + '.geojson', 'w') as f:
    #     f.write(convert_json(arr))
    #     # json.dump(convert_json(location.raw), f)
    # return app.send_static_file(name + '.geojson')


# Konvertiert Daten in ein valides Geojsonformat
# verwendet fake Daten aus der eigenen DB
def convert_json(ar):
    table_as_dict = []
    for row in ar:
        row_address = "Deutschland Bayern " + row.address.city + " " \
                      + str(row.address.plz) + " " + row.address.street \
                      + " " + str(row.address.number)
        row_coords = lookup_coords(row_address)
        row_as_dict = {
            'type': "Feature",
            'properties': {
                'modelname': row.modems.modelname,
                'mac': row.modems.mac,
                'status': row.modems.status,
                'wert': row.modems.wert,
                'name': row.address.name,
                'street': row.address.street,
                'number': row.address.number,
                'plz': row.address.plz,
                'city': row.address.city
            },
            'geometry': {
                'type': 'Point',
                # frontend api erwartet die Koordinaten getauscht
                'coordinates': [row_coords[1], row_coords[0]]
            }
        }
        table_as_dict.append(row_as_dict)
    geojson = {
        "type": "FeatureCollection",
        "features": table_as_dict
    }
    # Print vor Livebebrieb loeschen
    print(geojson)
    geojson = json.dumps(geojson, indent=4)
    return geojson


# die sleepzeit ist eine Nominatim Vorgabe
# kann mit eigenem Server reduziert oder sogar ganz weggelassen werden
def do_geocode(addr):
    try:
        return geolocator.geocode(addr)
    except GeocoderTimedOut:
        time.sleep(1)
        return do_geocode(addr)


# rueckgabe des geojons an das Frontend
@app.route('/return_geojson/<name>')
def return_geojson(name):
    g = geoj.query.filter_by(name=name).first()
    return g.jsondata


@app.route('/geojson_detail/<name>')
def geojson_detail(name):
    g = geoj.query.filter_by(name=name).first()
    return render_template('geojson_detail.html', geoj=g)


# schaut zuerst in lokaler Datenbank ob die Koordinaten bereits vorhanden sind
# wenn nicht wird die geokodierung aufgerufen
@app.route('/lookup/<addr>')
def lookup_coords(addr):
    m = mapAddress.query.filter_by(address=addr).first()
    if m:
        return [m.lat, m.lon]
    else:
        n = do_geocode(addr).raw
        for key, value in n.items():
            if key == 'lat':
                lat = value
            if key == 'lon':
                lon = value

        new_coords(addr, lat, lon)
        return [lat, lon]


# abspeichern neuer Geokodierungsdaten
def new_coords(addr, lat, lon):
    save = mapAddress(addr, lat, lon)
    db.session.add(save)
    db.session.commit()

