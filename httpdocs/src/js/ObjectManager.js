/* eslint-disable import/no-extraneous-dependencies,import/no-unresolved */
import _ from 'lodash';
import google from 'google';

export default class OM extends google.maps.MVCArray {
  constructor(map) {
    super();

    this.map = map;
    this.addListener('remove_at', (idx, elem) => {
      if (elem[0].setMap) {
        elem[0].setMap(null);
      } else if (elem.close) {
        elem[0].close();
      } else {
        throw new Error('cannot destroy item', elem);
      }
    });

    this.addListener('insert_at', (idx) => {
      const elem = this.getArray()[idx];
      const obj = elem[0];

      if (obj.open) {
        if (elem[3] instanceof google.maps.MVCObject) {
          obj.open(map, elem[3]);
        } else {
          obj.open(map);
        }
      } else {
        obj.setMap(map);
      }
    });
  }

  clearObject(id) {
    if (!id) {
      return;
    }

    this.forEach((elem, idx) => {
      if (elem && elem[2] === id) {
        this.removeAt(idx);
        return false;
      }
      return true;
    });
  }

  clearObjects(taggedAs) {
    this.forEach((elem, idx) => {
      if (elem && (taggedAs === undefined || elem[1] === taggedAs)) {
        this.removeAt(idx);
        _.defer(() => this.clearObjects(taggedAs));
        return false;
      }
      return true;
    });
  }

  findObject(id) {
    return this.getArray().filter(elem => elem[2] === id).pop();
  }

  showObject(obj, cls, id, options) {
    this.clearObject(id);
    this.push([obj, cls, id, options]);
    return obj;
  }
}

