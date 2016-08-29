import window from 'window';
import _ from 'lodash';
import google from 'google';

function createIconOption(stop, options, stepCount, angle) {
  return _.defaults((options || {}).icon || {}, {
    path: stop
      ? [
        'M',
        '33.25',
        '16.025278207000508',
        'C',
        '32.0125',
        '16.01137519315023',
        '29.875',
        '17.125',
        '28.5',
        '18.5',
        'C',
        '26.944444444444443',
        '20.055555555555557',
        '26',
        '22.133333333333333',
        '26',
        '24',
        'C',
        '26',
        '25.65',
        '26.718232309083987',
        '29.1375',
        '27.59607179796442',
        '31.75',
        'C',
        '28.817051115483906',
        '35.38370354993694',
        '28.934556004964225',
        '37.02877200266145',
        '28.09607179796442',
        '38.75',
        'C',
        '27.49323230908399',
        '39.9875',
        '27',
        '41.9',
        '27',
        '43',
        'C',
        '27',
        '44.1',
        '27.9',
        '45.45',
        '29',
        '46',
        'C',
        '30.1',
        '46.55',
        '31.5625',
        '46.79335988647727',
        '32.25',
        '46.54079974772727',
        'C',
        '32.9375',
        '46.28823960897727',
        '34.244611443600775',
        '44.60073960897727',
        '35.154692096890614',
        '42.79079974772727',
        'C',
        '36.06477275018045',
        '40.98085988647727',
        '37.29976312969924',
        '37.7',
        '37.89911516248792',
        '35.5',
        'C',
        '38.49846719527659',
        '33.3',
        '39.006023382671565',
        '28.8',
        '39.02701780114341',
        '25.5',
        'C',
        '39.05552142071855',
        '21.019668967058752',
        '38.61369715435026',
        '19.063165635728122',
        '37.28259473554611',
        '17.775278207000508',
        'C',
        '36.30216763099575',
        '16.826681220850787',
        '34.4875',
        '16.039181220850786',
        '33.25',
        '16.025278207000508',
        'Z',
        'M',
        '15.25',
        '18.025278207000508',
        'C',
        '14.0125',
        '18.01137519315023',
        '12.029399448381973',
        '19.0125',
        '10.843109885293275',
        '20.25',
        'C',
        '9.06600455055934',
        '22.103820450048765',
        '8.782723188934392',
        '23.29235909990247',
        '9.234286149351865',
        '27',
        'C',
        '9.535722657672789',
        '29.475',
        '10.956323209290815',
        '34.0875',
        '12.39117626405859',
        '37.25',
        'C',
        '13.826029318826365',
        '40.4125',
        '16.0125',
        '43.697443923338966',
        '17.25',
        '44.54987538519771',
        'C',
        '18.4875',
        '45.402306847056444',
        '20.4',
        '45.96020979614915',
        '21.5',
        '45.789659716514834',
        'C',
        '22.773760289505443',
        '45.59216888123285',
        '23.610306095530625',
        '44.57547853664944',
        '23.803773241635348',
        '42.989784331317125',
        'C',
        '23.970848524534787',
        '41.62040294909271',
        '23.408348524534787',
        '39.0375',
        '22.553773241635348',
        '37.25',
        'C',
        '21.64498244521012',
        '35.34909836954499',
        '21.01353030910185',
        '31.40558005856733',
        '21.03259473554611',
        '27.75',
        'C',
        '21.057182515417388',
        '23.035323791686757',
        '20.6272918537451',
        '21.07631897554676',
        '19.28259473554611',
        '19.775278207000508',
        'C',
        '18.302167630995747',
        '18.826681220850787',
        '16.4875',
        '18.039181220850786',
        '15.25',
        '18.025278207000508',
        'Z',
        ''].join(' ') : stepCount % 2 === 0 ? [
          'M',
          '6.75',
          '0.9674052644538893',
          'C',
          '5.512499999999999',
          '0.9494781599035285',
          '3.7238751931502287',
          '1.7369781599035283',
          '2.7752782070005075',
          '2.7174052644538893',
          'C',
          '1.537811369197653',
          '3.996395232246864',
          '1.0449905640558672',
          '6.195073224589727',
          '1.0308551414032063',
          '10.5',
          'C',
          '1.0200194414744117',
          '13.8',
          '1.5015328047234089',
          '18.3',
          '2.1008848375120888',
          '20.5',
          'C',
          '2.7002368703007686',
          '22.7',
          '3.9352272498195546',
          '25.980859886477273',
          '4.84530790310939',
          '27.790799747727274',
          'C',
          '5.755388556399225',
          '29.600739608977275',
          '7.0625',
          '31.288239608977275',
          '7.75',
          '31.540799747727274',
          'C',
          '8.4375',
          '31.793359886477273',
          '9.9',
          '31.55',
          '11',
          '31',
          'C',
          '12.1',
          '30.45',
          '13',
          '29.1',
          '13',
          '28',
          'C',
          '13',
          '26.9',
          '12.50676769091601',
          '24.9875',
          '11.90392820203558',
          '23.75',
          'C',
          '11.065443995035771',
          '22.028772002661448',
          '11.182948884516094',
          '20.383703549936946',
          '12.40392820203558',
          '16.75',
          'C',
          '13.281767690916011',
          '14.1375',
          '14',
          '10.65',
          '14',
          '9',
          'C',
          '14',
          '7.133333333333333',
          '13.055555555555555',
          '5.055555555555555',
          '11.5',
          '3.5',
          'C',
          '10.125',
          '2.125',
          '7.987500000000001',
          '0.9853323690042503',
          '6.75',
          '0.9674052644538893',
          'Z',
          'M',
          '22.75',
          '18.967405264453888',
          'C',
          '21.5125',
          '18.949478159903528',
          '19.723875193150228',
          '19.73697815990353',
          '18.775278207000508',
          '20.717405264453888',
          'C',
          '17.523506201306184',
          '22.01118040924059',
          '17.043624674242828',
          '24.213862596654838',
          '17.025278207000508',
          '28.75',
          'C',
          '17.010964011861812',
          '32.289163976901435',
          '16.326076083975728',
          '36.409634732011256',
          '15.44622675836466',
          '38.25',
          'C',
          '14.591651475465222',
          '40.0375',
          '14.029151475465222',
          '42.62040294909271',
          '14.19622675836466',
          '43.989784331317125',
          'C',
          '14.389693904469379',
          '45.57547853664944',
          '15.226239710494553',
          '46.592168881232844',
          '16.5',
          '46.789659716514834',
          'C',
          '17.6',
          '46.960209796149144',
          '19.5125',
          '46.40230684705644',
          '20.75',
          '45.5498753851977',
          'C',
          '21.9875',
          '44.697443923338966',
          '24.173970681173635',
          '41.4125',
          '25.60882373594141',
          '38.25',
          'C',
          '27.043676790709185',
          '35.0875',
          '28.46427734232721',
          '30.475',
          '28.765713850648137',
          '28',
          'C',
          '29.21727681106561',
          '24.29235909990247',
          '28.933995449440662',
          '23.103820450048765',
          '27.156890114706727',
          '21.25',
          'C',
          '25.970600551618027',
          '20.0125',
          '23.9875',
          '18.98533236900425',
          '22.75',
          '18.967405264453888',
          'Z',
          '',
        ].join(' ') : [
          'M',
          '23.25',
          '1.025278207000508',
          'C',
          '22.0125',
          '1.0113751931502286',
          '19.875',
          '2.125',
          '18.5',
          '3.5',
          'C',
          '16.944444444444443',
          '5.055555555555555',
          '16',
          '7.133333333333333',
          '16',
          '9',
          'C',
          '16',
          '10.65',
          '16.718232309083987',
          '14.1375',
          '17.59607179796442',
          '16.75',
          'C',
          '18.817051115483906',
          '20.383703549936943',
          '18.934556004964225',
          '22.028772002661448',
          '18.09607179796442',
          '23.75',
          'C',
          '17.49323230908399',
          '24.9875',
          '17',
          '26.9',
          '17',
          '28',
          'C',
          '17',
          '29.1',
          '17.9',
          '30.45',
          '19',
          '31',
          'C',
          '20.1',
          '31.55',
          '21.5625',
          '31.793359886477273',
          '22.25',
          '31.54079974772727',
          'C',
          '22.9375',
          '31.288239608977268',
          '24.244611443600775',
          '29.600739608977268',
          '25.154692096890614',
          '27.79079974772727',
          'C',
          '26.06477275018045',
          '25.980859886477273',
          '27.299763129699233',
          '22.7',
          '27.89911516248791',
          '20.5',
          'C',
          '28.49846719527659',
          '18.3',
          '29.006023382671565',
          '13.8',
          '29.02701780114341',
          '10.5',
          'C',
          '29.05552142071855',
          '6.019668967058752',
          '28.613697154350263',
          '4.063165635728123',
          '27.28259473554611',
          '2.7752782070005075',
          'C',
          '26.302167630995747',
          '1.8266812208507872',
          '24.4875',
          '1.0391812208507871',
          '23.25',
          '1.025278207000508',
          'Z',
          'M',
          '7.25',
          '19.025278207000508',
          'C',
          '6.012499999999999',
          '19.01137519315023',
          '4.029399448381974',
          '20.0125',
          '2.843109885293275',
          '21.25',
          'C',
          '1.066004550559339',
          '23.103820450048765',
          '0.782723188934392',
          '24.29235909990247',
          '1.234286149351865',
          '28',
          'C',
          '1.535722657672788',
          '30.475',
          '2.9563232092908143',
          '35.0875',
          '4.39117626405859',
          '38.25',
          'C',
          '5.826029318826366',
          '41.4125',
          '8.0125',
          '44.697443923338966',
          '9.25',
          '45.54987538519771',
          'C',
          '10.4875',
          '46.402306847056444',
          '12.4',
          '46.96020979614915',
          '13.5',
          '46.789659716514834',
          'C',
          '14.773760289505443',
          '46.59216888123285',
          '15.610306095530625',
          '45.57547853664944',
          '15.803773241635348',
          '43.989784331317125',
          'C',
          '15.970848524534787',
          '42.62040294909271',
          '15.408348524534787',
          '40.0375',
          '14.553773241635348',
          '38.25',
          'C',
          '13.644982445210116',
          '36.34909836954499',
          '13.013530309101847',
          '32.40558005856733',
          '13.032594735546109',
          '28.75',
          'C',
          '13.057182515417391',
          '24.03532379168675',
          '12.6272918537451',
          '22.07631897554676',
          '11.282594735546109',
          '20.775278207000508',
          'C',
          '10.302167630995749',
          '19.826681220850787',
          '8.4875',
          '19.039181220850786',
          '7.25',
          '19.025278207000508',
          'Z',
          '',
        ].join(' '),
    fillColor: '#233f5b',
    fillOpacity: 1,
    strokeWeight: 0,
    rotation: angle,
    scale: 1,
    anchor: new google.maps.Point(15, 24),
  });
}


class Footprint extends google.maps.Marker {

  constructor(markerOptions) {
    const options = _.omit(markerOptions, 'map', 'angle');
    const initialAngle = markerOptions && markerOptions.angle;

    super(_.defaults({
      icon: createIconOption(true, options, 0, initialAngle),
    }, options));

    this.angle = initialAngle;
    this.__map = markerOptions && markerOptions.map;
    this.__options = options;
  }

  startFrom(origin) {
    this.angle = 90;
    this.stepCount = 0;
    this.setOptions({ position: origin });
    this.setMap(this.__map);

    if (this.timer) {
      window.clearInterval(this.timer);
    }

    this.timer = window.setInterval(() => {
      this.setIcon(createIconOption(false, this.__options, ++this.stepCount, this.angle));
    }, 500);
  }

  stop() {
    this.setIcon(createIconOption(true, this.__options, this.stepCount, this.angle));
    window.clearInterval(this.timer);
  }

  setAngle(angle) {
    this.angle = angle;
  }
}

module.exports = Footprint;

