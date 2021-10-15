import fs from "fs";
import {
  // Proxies,
  // ProxyHandlerInputs,
  ProxyLocation,
  ProxySingle,
} from "./proxy-types";

export class ProxyHandlerDataStore {
  //	Automatically store in memory unless persist and location is set
  private _location: ProxyLocation = [];
  //	Write/overwrite to disk
  private _persist = false;
  //	flattened method is on the prototype because it is added whenever the proxies are requested.
  private _proxies = [] as ProxySingle[];

  private _flatten = function flattened(proxies: ProxySingle[]) {
    let flat = [] as ProxySingle[];
    if (Array.isArray(proxies)) {
      let x = proxies.length;
      while (x--) {
        if (proxies[x].id) {
          if (proxies[x].id.href) {
            flat.push(proxies[x].id.href);
          } else throw new Error(`No "href" property found on ${proxies[x].id}`);
        } else throw new Error(`No "id" property found on ${proxies[x]}`);
      }
    } else flat = proxies;
    return flat;
  };

  get location(): ProxyLocation {
    return this._location;
  }

  set location(proxyLocation: ProxyLocation) {
    /**
     * This can accept either a string representing a filename
     * to save out to, or, an array of proxies which will automatically
     * be stored in this._proxies, where it belongs.
     *
     * This allows the user to be flexible by allowing this module to
     * temporarily hold on to (and not forget) about a proxy list
     * moving it along to where it belongs and then later allowing
     * the user to set a filepath location at their convenience in
     * order to enable persistence.
     */

    if (typeof proxyLocation === `string`) {
      this.setDataStoreAsString(proxyLocation);
    } else if (Array.isArray(proxyLocation)) {
      //	Temporarily hold on to the array of proxies
      this._proxies = proxyLocation;
    } else if (typeof proxyLocation === `object`) {
      throw new Error(`Datastorage is expected to be an array of proxies, not an object!`);
    } else {
      throw new Error(`Datastorage must be a filename (on disk) or an array (in memory)!`);
    }
  }

  private setDataStoreAsString(newName: ProxyLocation) {
    throw new Error(`Datastorage location as string is not implemented`);
    // /**
    //  * This TRY/CATCH block needs to be thoroughly tested
    //  * Because it needs to know how to juggle the filename or
    //  * the array that was passed in, while making sure
    //  * that the file it will be writing to is accessible and not corrupted.
    //  *
    //  * If corrupted, initialize with empty array.
    //  * If readable, check that it is an array and then load into memory.
    //  * If not an array, throw an error.
    //  */
    // this._location = newName;

    // try {
    //   /* eslint-disable  @typescript-eslint/no-var-requires */
    //   const fromDisk = require(newName);
    //   if (!Array.isArray(fromDisk)) {
    //     //	File contents must be an array.
    //     throw new Error(`Datastorage is expected to be an array of proxies!`);
    //   } else {
    //     this._proxies = fromDisk; //	Success
    //   }
    // } catch (e) {
    //   console.error(e);
    //   if (this._persist) {
    //     //	Initialize a new proxy list (array) on disk.
    //     fs.writeFileSync(newName, `[]`);
    //   }
    // }
  }

  get persist(): boolean {
    return this._persist;
  }

  set persist(persistence: boolean) {
    if (!this._location) {
      throw new Error(`ProxyHandlerDataStore "location" must be set before "persist" can be enabled.`);
    }
    this._persist = persistence;
  }

  get proxies() {
    return this._flatten(this._proxies);
  }

  set proxies(input: any) {
    if (this._persist) {
      // Determine if it is in memory (should not be possible) because persist requires filesystem
      if (typeof this._location === `string`) {
        // Or else if it is a filename then write to disk
        fs.writeFileSync(this._location, input);
      }
    }
    this._proxies = input;
    // this._proxies.flattened = flatten;	//	May be redundant TODO figure out if should place on GET or SET
  }

  constructor(input?: any) {
    if (input) {
      //	Must go first because can throw error when setting persist (persist requires filesystem location)
      if (input.location) this.location = input.location;
      Object.assign(this, ...Object.keys(input).map((k) => ({ [k]: input[k] })));
    }
  }
}
