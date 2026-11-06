import express from "express";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

router.get("/", async (req, res) => {
  
  res.render("search", {
    query: 0,
    data: []
  });
});

router.post("/", async (req, res) => {

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );

  let { data, error } = await supabase
    .from('OBJAVA')
    .select(`
      KORISNIK!id_autor (
        ime,
        prezime
      ),
      LOKACIJA!id_lokacije (
        ime_lokacije,
        ime_drzave
      ),
      check_in,
      check_out,
      ukupna_cijena,
      ukupni_kapacitet,
      preostalih_mjesta,
      id_objava,
      OBJAVA_TAG!id_objava (
        TAG!id_tag (
          ime_tag
        )
      )
    `);

  if (error) {
    return res.status(500).send(error.message);
  }

  data.forEach(item => {
    item.keep = true;
    if (req.body.location && item.LOKACIJA.ime_lokacije.toLowerCase() !== req.body.location.toLowerCase()) {
      item.keep = false;
      return;
    }
    if (req.body.organizator && (item.KORISNIK.ime + " " + item.KORISNIK.prezime).toLowerCase() !== req.body.organizator.toLowerCase()) {
      item.keep = false;
      return;
    }

    if (req.body.checkin 
      && ((req.body.rcheckin === "exact" && new Date(item.check_in).toDateString() !== new Date(req.body.checkin).toDateString())
      || (req.body.rcheckin === "before" && new Date(item.check_in) > new Date(req.body.checkin))
      || (req.body.rcheckin === "after" && new Date(item.check_in) < new Date(req.body.checkin)))) {
      item.keep = false;
      return;
    }
    if (req.body.checkout 
      && ((req.body.rcheckout === "exact" && new Date(item.check_out).toDateString() !== new Date(req.body.checkout).toDateString())
      || (req.body.rcheckout === "before" && new Date(item.check_out) > new Date(req.body.checkout))
      || (req.body.rcheckout === "after" && new Date(item.check_out) < new Date(req.body.checkout)))) {
      item.keep = false;
      return;
    }
    if (req.body.price 
      && ((req.body.rprice === "min" && item.ukupna_cijena / item.ukupni_kapacitet < parseFloat(req.body.price))
      || (req.body.rprice === "exact" && item.ukupna_cijena / item.ukupni_kapacitet !== parseFloat(req.body.price))
      || (req.body.rprice === "max" && item.ukupna_cijena / item.ukupni_kapacitet > parseFloat(req.body.price)))) {
      item.keep = false;
      return;
    }
    if (req.body.capacity 
      && ((req.body.rcapacity === "min" && item.ukupni_kapacitet < parseInt(req.body.capacity))
      || (req.body.rcapacity === "exact" && item.ukupni_kapacitet !== parseInt(req.body.capacity))
      || (req.body.rcapacity === "max" && item.ukupni_kapacitet > parseInt(req.body.capacity)))) {
      item.keep = false;
      return;
    }
  });

  data = data.filter(item => item.keep);

  let rtags = [];
  if (req.body.tags) {
    if (typeof req.body.tags === "string") {
      rtags.push(req.body.tags);
    } else {
      rtags = req.body.tags;
    }
  }

  if (req.body.tags) {
    data.forEach(item => {
      let tags = item.OBJAVA_TAG.map(tag => tag.TAG.ime_tag);
      // ODKOMENTIRAJ AKO ZELIS DA SE MORAJU SVI TAGOVI PODUDARATI I NE SMIJE BITI NIJEDAN NEOZNACENI TAG
      // if (tags.length !== rtags.length) {
      //   item.keep = false;
      //   return;
      // }
      let counter = 0;
      rtags.forEach(tag => {
        if (tags.includes(tag)) {
          counter++;
        }
      })
      if (counter !== rtags.length) {
        item.keep = false;
        return;
      }
    });
  }

  data = data.filter(item => item.keep);

  res.render("search", {
    query: 1,
    data: data
  })
});

export default router;