from flask import Flask
from flask import render_template
from flask import request, flash, url_for, redirect
# from models import db
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
    coord1 = db.Column(db.String(20), unique=False)
    coord2 = db.Column(db.String(20), unique=False)

    def __init__(self, modelname, mac, wert, coord1, coord2):
        self.modelname = modelname
        self.mac = mac
        self.wert = wert
        self.coord1 = coord1
        self.coord2 = coord2

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

db.create_all()


# home site
@app.route('/')
def index():
    return render_template('index.html', geoj=geoj.query.all())


# beispiel für attributübergabe
@app.route('/user/<username>')
def show_user_profile(username):
    return 'Hello User %s!' % username


# a mapowerview over the complete set of modems
@app.route('/map_default')
def show_map():
    return render_template('map_default.html')


@app.route('/map/<name>')
def show_map_dynamic(name):
    return render_template('map_dynamic.html', jsonName=name)


# just something to play around can be deleted
@app.route('/circle')
def show_circle():
    return render_template('circles.html')


# Modems anzeigen
@app.route('/all')
def show_all():
   return render_template('show_all.html', modems=modems.query.all())


# Adressview anzeigen
@app.route('/address')
def show_address():
   return render_template('address.html', address=address.query.all())


# neue Modems
@app.route('/new', methods=['GET', 'POST'])
def new():
    if request.method == 'POST':
        if not request.form['modelname'] or not request.form['wert'] or not request.form['coord1']:
            flash('Please enter all the fields', 'error')
        else:
            modem = modems(request.form['modelname'], request.form['mac'], request.form['wert'],
                               request.form['coord1'], request.form['coord2'])

            db.session.add(modem)
            db.session.commit()

            flash('Record was successfully added')
            return redirect(url_for('show_all'))
    return render_template('new.html')


# neue Adressen
@app.route('/new_address', methods=['GET', 'POST'])
def new_address():
    if request.method == 'POST':
        if not request.form['name'] or not request.form['street'] or not request.form['number'] \
                or not request.form['plz'] or not request.form['city'] or not request.form['mac']:
            flash('Please enter all the fields', 'error')
        else:
            addr = address(request.form['name'], request.form['street'],
                               request.form['number'], request.form['plz'], request.form['city'], request.form['mac'])

            db.session.add(addr)
            db.session.commit()

            flash('Record was successfully added')
            return redirect(url_for('show_address'))
    return render_template('new_address.html')


def save_json(name, geojson):
    # g = geoj.query.filter_by(name=name)
    save = geoj(name, geojson)

    # if(g.name == name):
    #     db.session.query().\
    #         filter(geoj.name == name).\
    #         update({"name": geojson})
    #     db.session.commit()
    # else:
    #     db.session.add(save)
    db.session.add(save)
    db.session.commit()

    flash('Json was successfully saved')


@app.route('/geojson')
def show_geojson():
    return render_template('geojson.html', geoj=geoj.query.all())


# overwrites a geojson with new data
# later this strings have to be replaced with a parameter array
@app.route('/create/<name>')
def create_geojson(name):
    arr = [(do_geocode("Deutschland Bayern Rosenheim 83022 Münchener Straße 36")).raw,
           (do_geocode("Deutschland Bayern Rosenheim 83022 Münchener Straße 30")).raw,
           (do_geocode("Deutschland Bayern Rosenheim 83022 Münchener Straße 25")).raw,
           (do_geocode("Deutschland Bayern Rosenheim 83022 Münchener Straße 14")).raw,
           (do_geocode("Deutschland Bayern Rosenheim 83022 Münchener Straße 39")).raw,
           (do_geocode("Deutschland Bayern Rosenheim 83022 Bahnhofstraße 5")).raw,
           (do_geocode("Deutschland Bayern Rosenheim 83022 Salinstraße 2")).raw,
           (do_geocode("Deutschland Bayern Rosenheim 83022 Samerstraße 6")).raw]
    # später in schleife verpacken ... Daten sollten dann von Datenbank kommen
    # arr.append((do_geocode("Deutschland Bayern Rosenheim 83022 Innstraße 17")).raw)
    # arr.append((do_geocode("Germany Bavaria Rosenheim 83022 Innstraße 13")).raw)
    # arr.append((do_geocode("Germany Bavaria Rosenheim 83022 Innstraße 42")).raw)
    # arr.append((do_geocode("Germany Bavaria Rosenheim 83022 Innstraße 26")).raw)
    # arr.append((do_geocode("Germany Bavaria Rosenheim 83022 Innstraße 25")).raw)
    # arr.append((do_geocode("Germany Bavaria Rosenheim 83022 Am Innreit 2")).raw)
    # arr.append((do_geocode("Germany Bavaria Rosenheim 83022 Innstraße 16")).raw)
    # arr.append((do_geocode("Germany Bavaria Rosenheim 83022 Innstraße 27")).raw)
    # arr.append((do_geocode("Germany Bavaria Rosenheim 83022 Bayerstraße 2")).raw)
    # arr.append((do_geocode("Germany Bavaria Rosenheim 83022 Innstraße 30")).raw)
    # arr.append((do_geocode("Germany Bavaria Rosenheim 83022 Innstraße 29")).raw)
    # arr.append((do_geocode("Germany Bavaria Rosenheim 83022 Innstraße 36")).raw)
    # arr.append((do_geocode("Germany Bavaria Rosenheim 83022 Innstraße 19")).raw)
    # arr.append((do_geocode("Germany Bavaria Rosenheim 83022 Am Nörreut 10")).raw)
    # arr.append((do_geocode("Germany Bavaria Rosenheim 83022 Am Nörreut 12")).raw)
    # arr.append((do_geocode("Germany Bavaria Rosenheim 83022 Am Nörreut 19")).raw)
    # arr.append((do_geocode("Germany Bavaria Rosenheim 83022 Sedanstraße 1")).raw)
    # arr.append((do_geocode("Germany Bavaria Rosenheim 83022 Sedanstraße 5")).raw)
    # arr.append((do_geocode("Germany Bavaria Rosenheim 83022 Sedanstraße 10")).raw)
    # arr.append((do_geocode("Germany Bavaria Rosenheim 83022 Am Nörreut 7")).raw)
    # arr.append((do_geocode("Germany Bavaria Rosenheim 83022 Am Nörreut 20")).raw)
    # arr.append((do_geocode("Germany Bavaria Rosenheim 83022 Hofmannstraße 4")).raw)
    # arr.append((do_geocode("Germany Bavaria Rosenheim 83022 Hofmannstraße 7")).raw)
    # arr.append((do_geocode("Germany Bavaria Rosenheim 83022 Innstraße 52")).raw)
    # arr.append((do_geocode("Deutschland Bayern Rosenheim 83022 Innstraße 37")).raw)
    # arr.append((do_geocode("Deutschland Bayern Rosenheim 83022 Innstraße 48")).raw)
    # arr.append((do_geocode("Deutschland Bayern Rosenheim 83022 Bayerstraße 6")).raw)
    # arr.append((do_geocode("Deutschland Bayern Rosenheim 83022 Hofmannstraße 12a")).raw)
    # arr.append((do_geocode("Deutschland Bayern Rosenheim 83026 Johannesweg 3")).raw)
    # arr.append((do_geocode("Deutschland Bayern Rosenheim 83026 Am Bach 2")).raw)
    # arr.append((do_geocode("Deutschland Bayern Rosenheim 83026 Dorfstraße 5")).raw)
    # arr.append((do_geocode("Deutschland Bayern Rosenheim 83026 Am Wasen 9")).raw)
    # arr.append((do_geocode("Deutschland Bayern Rosenheim 83026 Panger Straße 30")).raw)
    # arr.append((do_geocode("Deutschland Bayern Rosenheim 83026 Bergblick 9")).raw)
    # arr.append((do_geocode("Deutschland Bayern Rosenheim 83026 Mitteralmweg 33")).raw)
    # arr.append((do_geocode("Deutschland Bayern Rosenheim 83026 Mitteralmweg 19")).raw)
    # arr.append((do_geocode("Deutschland Bayern Rosenheim 83026 Rehleitenweg 3")).raw)
    # arr.append((do_geocode("Deutschland Bayern Rosenheim 83026 Hocheckstraße 8")).raw)
    # arr.append((do_geocode("Deutschland Bayern Rosenheim 83022 Königstraße 24")).raw)
    # arr.append((do_geocode("Deutschland Bayern Rosenheim 83022 Königstraße 11")).raw)
    save_json(name, convert_json(arr))

    with open('static/' + name + '.geojson', 'w') as f:
        f.write(convert_json(arr))
        # json.dump(convert_json(location.raw), f)
    return app.send_static_file(name + '.geojson')

    # return "<a href=%s>file</a>" % url_for('static', filename='modem.geojson')


# converts an array of nominatim raw data in a valid Geojson
# maybe I can call the data-mapping method here
def convert_json(ar):
    import json
    return json.dumps({ "type": "FeatureCollection",
                        "features": [
                                        {"type": "Feature",
                                         "geometry": { "type": "Point",
                                                       "coordinates": [ float(feat['lon']),
                                                                        float(feat['lat'])]},
                                         "properties": { key: value
                                                         for key, value in feat.items()
                                                         if key not in ('lat', 'lon', 'boundingbox') }
                                         }
                                        for feat in ar
                                    ]
                        })


# code thanks to time.sleep() very slow, but it has to be because of nominatims usage policy
# catches the timeoutexception and trys again
# maybe not so much of a problem if a own server is used for nominatim
def do_geocode(address):
    try:
        return geolocator.geocode(address)
    except GeocoderTimedOut:
        time.sleep(1)
        return do_geocode(address)


# rückgabe des gjons an das Frontend
@app.route('/return_geojson/<name>')
def return_geojson(name):
    g = geoj.query.filter_by(name=name).first()
    return g.jsondata




