from flask import Flask
from flask import render_template
from flask import request, flash, url_for, redirect
from flask_sqlalchemy import SQLAlchemy
from flask import json
# from flask import request
import requests
import json
import os
import time

# geocoding
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut

# geolocator needs a high timeout, because Nominatim is slow as fuck
# timeout-time can be reduced by using a Try statement
# higher timeout could reduce the amount of exception a lead to a better performance
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

db = SQLAlchemy(app)


# if __name__ = '__main__':
#     app.run()
app.config['DEBUG'] = True


#Adresse
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


# home site
@app.route('/')
def index():
    return render_template('index.html', geoj=geoj.query.all())


# beispiel fuer attributuebergabe
@app.route('/user/<username>')
def show_user_profile(username):
    return 'Hello User %s!' % username


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


# save a json into the database
def save_json(name, geojson):
    save = geoj(name, geojson)
    db.session.add(save)
    db.session.commit()
    # flash('Json was successfully saved')


# render the geojson-view
@app.route('/geojson')
def show_geojson():
    return render_template('geojson.html', geoj=geoj.query.all())


@app.route('/leaflet')
def show_leaflet():
    return render_template('leaflet.html')


# overwrites a geojson with new data
# later this strings have to be replaced with a parameter array
@app.route('/create/<name>')
def create_geojson(name):
    arr = []
    # spaeter in schleife verpacken ... Daten sollten dann von Datenbank kommen
    arr.append((lookup_coords("Deutschland Bayern Rosenheim 83022 Innstraße 17")))
    arr.append((lookup_coords("Germany Bavaria Rosenheim 83022 Innstraße 13")))
    arr.append((lookup_coords("Germany Bavaria Rosenheim 83022 Innstraße 42")))
    arr.append((lookup_coords("Germany Bavaria Rosenheim 83022 Innstraße 26")))
    arr.append((lookup_coords("Germany Bavaria Rosenheim 83022 Innstraße 25")))
    arr.append((lookup_coords("Germany Bavaria Rosenheim 83022 Innstraße 16")))
    arr.append((lookup_coords("Germany Bavaria Rosenheim 83022 Innstraße 27")))
    arr.append((lookup_coords("Germany Bavaria Rosenheim 83022 Bayerstraße 2")))
    arr.append((lookup_coords("Germany Bavaria Rosenheim 83022 Innstraße 30")))
    arr.append((lookup_coords("Germany Bavaria Rosenheim 83022 Innstraße 29")))
    arr.append((lookup_coords("Germany Bavaria Rosenheim 83022 Innstraße 36")))
    arr.append((lookup_coords("Germany Bavaria Rosenheim 83022 Innstraße 19")))
    arr.append((lookup_coords("Germany Bavaria Rosenheim 83022 Am Nörreut 10")))
    arr.append((lookup_coords("Germany Bavaria Rosenheim 83022 Am Nörreut 12")))
    arr.append((lookup_coords("Germany Bavaria Rosenheim 83022 Am Nörreut 19")))
    arr.append((lookup_coords("Germany Bavaria Rosenheim 83022 Sedanstraße 1")))
    arr.append((lookup_coords("Germany Bavaria Rosenheim 83022 Sedanstraße 5")))
    arr.append((lookup_coords("Germany Bavaria Rosenheim 83022 Sedanstraße 10")))
    arr.append((lookup_coords("Germany Bavaria Rosenheim 83022 Am Nörreut 7")))
    arr.append((lookup_coords("Germany Bavaria Rosenheim 83022 Am Nörreut 20")))
    arr.append((lookup_coords("Germany Bavaria Rosenheim 83022 Am Nörreut 20")))
    arr.append((lookup_coords("Germany Bavaria Rosenheim 83022 Hofmannstraße 4")))
    arr.append((lookup_coords("Germany Bavaria Rosenheim 83022 Hofmannstraße 7")))
    arr.append((lookup_coords("Germany Bavaria Rosenheim 83022 Innstraße 52")))
    arr.append((lookup_coords("Deutschland Bayern Rosenheim 83022 Innstraße 37")))
    arr.append((lookup_coords("Deutschland Bayern Rosenheim 83022 Innstraße 48")))
    arr.append((lookup_coords("Deutschland Bayern Rosenheim 83022 Bayerstraße 6")))
    arr.append((lookup_coords("Deutschland Bayern Rosenheim 83022 Hofmannstraße 12a")))
    arr.append((lookup_coords("Deutschland Bayern Rosenheim 83026 Johannesweg 3")))
    arr.append((lookup_coords("Deutschland Bayern Rosenheim 83026 Am Bach 2")))
    arr.append((lookup_coords("Deutschland Bayern Rosenheim 83026 Dorfstraße 5")))
    arr.append((lookup_coords("Deutschland Bayern Rosenheim 83026 Am Wasen 9")))
    arr.append((lookup_coords("Deutschland Bayern Rosenheim 83026 Panger Straße 30")))
    arr.append((lookup_coords("Deutschland Bayern Rosenheim 83026 Bergblick 9")))
    arr.append((lookup_coords("Deutschland Bayern Rosenheim 83026 Mitteralmweg 33")))
    arr.append((lookup_coords("Deutschland Bayern Rosenheim 83026 Mitteralmweg 19")))
    arr.append((lookup_coords("Deutschland Bayern Rosenheim 83026 Rehleitenweg 3")))
    arr.append((lookup_coords("Deutschland Bayern Rosenheim 83026 Hocheckstraße 8")))
    arr.append((lookup_coords("Deutschland Bayern Rosenheim 83022 Königstraße 24")))
    arr.append((lookup_coords("Deutschland Bayern Rosenheim 83022 Königstraße 11")))
    arr.append((lookup_coords("Deutschland Bayern Rosenheim 83026 Am Rackermoos 3")))
    arr.append((lookup_coords("Deutschland Bayern Rosenheim 83026 Am Rackermoos 16")))
    arr.append((lookup_coords("Deutschland Bayern Rosenheim 83026 Am Rackermoos 32")))
    arr.append((lookup_coords("Deutschland Bayern Rosenheim 83026 Alte Landstraße 6")))
    arr.append((lookup_coords("Deutschland Bayern Rosenheim 83026 Alte Landstraße 12a")))
    arr.append((lookup_coords("Deutschland Bayern Rosenheim 83026 Alte Landstraße 40")))
    arr.append((lookup_coords("Deutschland Bayern Rosenheim 83026 Alte Landstraße 49")))
    arr.append((lookup_coords("Deutschland Bayern Rosenheim 83026 Alte Landstraße 2")))
    arr.append((lookup_coords("Deutschland Bayern Rosenheim 83026 Schwaiger Weg 7")))
    arr.append((lookup_coords("Deutschland Bayern Rosenheim 83026 Schwaiger Weg 13")))
    arr.append((lookup_coords("Deutschland Bayern Rosenheim 83026 Sepp-Heindl-Straße 7")))
    arr.append((lookup_coords("Deutschland Bayern Rosenheim 83026 Dr.-Steinbeißer-Straße 2")))
    arr.append((lookup_coords("Deutschland Bayern Rosenheim 83026 Finkenweg 1")))
    arr.append((lookup_coords("Deutschland Bayern Rosenheim 83026 Finkenweg 11")))
    arr.append((lookup_coords("Deutschland Bayern Rosenheim 83022 Fichtenweg 6")))
    arr.append((lookup_coords("Deutschland Bayern Rosenheim 83022 Fichtenweg 14")))
    arr.append((lookup_coords("Deutschland Bayern Rosenheim 83022 Fichtenweg 32")))
    arr.append((lookup_coords("Deutschland Bayern Rosenheim 83022 Erlenweg 13a")))
    arr.append((lookup_coords("Deutschland Bayern Rosenheim 83022 Ahornweg 5")))
    arr.append((lookup_coords("Deutschland Bayern Rosenheim 83022 Ulmenweg 7")))
    arr.append((lookup_coords("Deutschland Bayern Rosenheim 83022 Birkenweg 10")))
    arr.append((lookup_coords("Deutschland Bayern Rosenheim 83022 Buchenweg 12")))
    arr.append((lookup_coords("Deutschland Bayern Rosenheim 83022 Hainholzstraße 16")))
    arr.append((lookup_coords("Deutschland Bayern Rosenheim 83022 Tannenweg 7")))
    arr.append((lookup_coords("Deutschland Bayern Rosenheim 83022 Eichenweg 9")))
    arr.append((lookup_coords("Deutschland Bayern Rosenheim 83022 Eichenweg 31")))
    arr.append((lookup_coords("Deutschland Bayern Rosenheim 83024 Mitterweg 15")))
    arr.append((lookup_coords("Deutschland Bayern Rosenheim 83024 Danziger Strasse 6")))
    arr.append((lookup_coords("Deutschland Bayern Rosenheim 83024 Breslauer Strasse 8")))
    arr.append((lookup_coords("Deutschland Bayern Stephanskirchen 83071 Salzburger Strasse 42")))
    arr.append((lookup_coords("Deutschland Bayern Stephanskirchen 83071 Salzburger Strasse 64")))
    arr.append((lookup_coords("Deutschland Bayern Rosenheim 83022 Herbststrasse 1")))
    arr.append((lookup_coords("Deutschland Bayern Rosenheim 83022 Ellmaierstrasse 18")))
    arr.append((lookup_coords("Deutschland Bayern Rosenheim 83022 Ellmaierstrasse 18")))
    arr.append((lookup_coords("Deutschland Bayern Rosenheim 83022 Ellmaierstrasse 18")))
    arr.append(lookup_coords("Deutschland Bayern Rosenheim 83022 Am Innreit 2"))
    arr.append(lookup_coords("Deutschland Bayern Rosenheim 83022 Ellmaierstrasse 2"))
    arr.append(lookup_coords("Deutschland Bayern Rosenheim 83022 Ellmaierstrasse 3"))
    arr.append(lookup_coords("Deutschland Bayern Rosenheim 83022 Ellmaierstrasse 4"))
    arr.append(lookup_coords("Deutschland Bayern Rosenheim 83022 Ellmaierstrasse 5"))
    arr.append(lookup_coords("Deutschland Bayern Rosenheim 83022 Ellmaierstrasse 6"))
    arr.append(lookup_coords("Deutschland Bayern Rosenheim 83022 Ellmaierstrasse 7"))
    arr.append(lookup_coords("Deutschland Bayern Rosenheim 83022 Ellmaierstrasse 8"))
    arr.append(lookup_coords("Deutschland Bayern Rosenheim 83022 Ellmaierstrasse 9"))
    arr.append(lookup_coords("Deutschland Bayern Rosenheim 83022 Ellmaierstrasse 10"))
    arr.append(lookup_coords("Deutschland Bayern Rosenheim 83022 Ellmaierstrasse 11"))
    arr.append(lookup_coords("Deutschland Bayern Rosenheim 83022 Ellmaierstrasse 12"))
    arr.append(lookup_coords("Deutschland Bayern Rosenheim 83022 Ellmaierstrasse 13"))
    print(arr)
    return "Erfolgreich!"
    # save_json(name, convert_json(arr))
    #
    # with open('static/' + name + '.geojson', 'w') as f:
    #     f.write(convert_json(arr))
    #     # json.dump(convert_json(location.raw), f)
    # return app.send_static_file(name + '.geojson')


# also die neue Idee waere das hier mit den Daten zu fuellen und dann in das Json werfen
class geoObject:

    def __init__(self, mac, coords, addr, status, wert):
        self.mac = mac
        self.coords = coords
        self.address = addr
        self.status = status
        self.wert = wert


# converts an array of nominatim raw data in a valid Geojson
# muss nochmal mit den richtigen Daten gemacht werden
def convert_json(ar):
    j = {"type": "FeatureCollection",
         "features": [
            {"type": "Feature",
             "geometry": {"type": "Point",
                          "coordinates": [float(feat['lon']),
                                          float(feat['lat'])]},
             "properties": {"data": {"status": "ok"},
                            "osm": {key: value
                                    for key, value in feat.items()
                                    if key not in ('lat', 'lon', 'boundingbox')}
                            }
             }for feat in ar
         ]
    }

    j = json.dumps(j, indent=4)

    return j


# code thanks to time.sleep() very slow, but it has to be because of nominatims usage policy
# catches the timeoutexception and trys again
# maybe not so much of a problem if a own server is used for nominatim
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
        return (m.lat, m.lon)
    else:
        n = do_geocode(addr).raw
        for key, value in n.items():
            if key == 'lat':
                lat = value
            if key == 'lon':
                lon = value

        new_coords(addr, lat, lon)
        return (lat, lon)


# abspeichern neuer Geokodierungsdaten
def new_coords(addr, lat, lon):
    save = mapAddress(addr, lat, lon)
    db.session.add(save)
    db.session.commit()

