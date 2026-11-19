-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.KORISNIK (
  id_korisnik uuid NOT NULL DEFAULT gen_random_uuid(),
  ime character varying,
  prezime character varying,
  datum_rodenja date,
  spol USER-DEFINED,
  mjesto_stanovanja character varying,
  email character varying NOT NULL UNIQUE,
  profilna_slika_url text,
  uloga USER-DEFINED DEFAULT 'registrirani_korisnik'::korisnik_uloga,
  status_korisnickog_racuna USER-DEFINED DEFAULT 'aktivan'::status_korisnickog_racuna,
  datum_kreiranja_racuna timestamp with time zone DEFAULT now(),
  opis text,
  CONSTRAINT KORISNIK_pkey PRIMARY KEY (id_korisnik)
);
CREATE TABLE public.TAG (
  id_tag uuid NOT NULL DEFAULT gen_random_uuid(),
  ime_tag character varying NOT NULL UNIQUE,
  CONSTRAINT TAG_pkey PRIMARY KEY (id_tag)
);
CREATE TABLE public.KORISNIK_TAGOVI (
  id_tag uuid NOT NULL,
  id_korisnik uuid NOT NULL,
  CONSTRAINT KORISNIK_TAGOVI_pkey PRIMARY KEY (id_tag, id_korisnik),
  CONSTRAINT KORISNIK_TAGOVI_id_tag_fkey FOREIGN KEY (id_tag) REFERENCES public.TAG(id_tag),
  CONSTRAINT KORISNIK_TAGOVI_id_korisnik_fkey FOREIGN KEY (id_korisnik) REFERENCES public.KORISNIK(id_korisnik)
);
CREATE TABLE public.LOKACIJA (
  id_lokacije uuid NOT NULL DEFAULT gen_random_uuid(),
  ime_lokacije character varying NOT NULL UNIQUE,
  latitude numeric,
  longitude numeric,
  ime_drzave text CHECK (length(ime_drzave) < 100),
  CONSTRAINT LOKACIJA_pkey PRIMARY KEY (id_lokacije)
);
CREATE TABLE public.OBJAVA (
  id_objava uuid NOT NULL DEFAULT gen_random_uuid(),
  id_autor uuid NOT NULL,
  id_lokacije uuid NOT NULL,
  check_in date NOT NULL,
  check_out date NOT NULL,
  ukupna_cijena numeric NOT NULL,
  ukupni_kapacitet integer NOT NULL CHECK (ukupni_kapacitet > 0),
  preostalih_mjesta integer,
  opis text NOT NULL,
  booking_url text,
  rok_prijave timestamp with time zone NOT NULL,
  status_objave USER-DEFINED DEFAULT 'otvorena'::status_objave,
  datum_kreiranja_objave timestamp with time zone DEFAULT now(),
  CONSTRAINT OBJAVA_pkey PRIMARY KEY (id_objava),
  CONSTRAINT OBJAVA_id_autor_fkey FOREIGN KEY (id_autor) REFERENCES public.KORISNIK(id_korisnik),
  CONSTRAINT OBJAVA_id_lokacije_fkey FOREIGN KEY (id_lokacije) REFERENCES public.LOKACIJA(id_lokacije)
);
CREATE TABLE public.OBJAVA_SLIKA (
  id_slika uuid NOT NULL DEFAULT gen_random_uuid(),
  id_objava uuid NOT NULL,
  url_slika text,
  CONSTRAINT OBJAVA_SLIKA_pkey PRIMARY KEY (id_slika),
  CONSTRAINT OBJAVA_SLIKA_id_objava_fkey FOREIGN KEY (id_objava) REFERENCES public.OBJAVA(id_objava)
);
CREATE TABLE public.OBJAVA_TAG (
  id_tag uuid NOT NULL,
  id_objava uuid NOT NULL,
  CONSTRAINT OBJAVA_TAG_pkey PRIMARY KEY (id_tag, id_objava),
  CONSTRAINT OBJAVA_TAG_id_tag_fkey FOREIGN KEY (id_tag) REFERENCES public.TAG(id_tag),
  CONSTRAINT OBJAVA_TAG_id_objava_fkey FOREIGN KEY (id_objava) REFERENCES public.OBJAVA(id_objava)
);
CREATE TABLE public.SPREMLJENA_OBJAVA (
  id_korisnik uuid NOT NULL,
  id_objava uuid NOT NULL,
  CONSTRAINT SPREMLJENA_OBJAVA_pkey PRIMARY KEY (id_korisnik, id_objava),
  CONSTRAINT SPREMLJENA_OBJAVA_id_korisnik_fkey FOREIGN KEY (id_korisnik) REFERENCES public.KORISNIK(id_korisnik),
  CONSTRAINT SPREMLJENA_OBJAVA_id_objava_fkey FOREIGN KEY (id_objava) REFERENCES public.OBJAVA(id_objava)
);
CREATE TABLE public.ZAHTJEV_ZA_PRIDRUZIVANJE (
  id_zahtjev uuid NOT NULL DEFAULT gen_random_uuid(),
  id_podnositelja uuid NOT NULL,
  id_objava uuid NOT NULL,
  status_zahtjeva USER-DEFINED DEFAULT 'na_cekanju'::status_zahtjeva_za_pridruzivanje,
  datum_kreiranja_zahtjeva timestamp with time zone DEFAULT now(),
  CONSTRAINT ZAHTJEV_ZA_PRIDRUZIVANJE_pkey PRIMARY KEY (id_zahtjev),
  CONSTRAINT ZAHTJEV_ZA_PRIDRUZIVANJE_id_podnositelja_fkey FOREIGN KEY (id_podnositelja) REFERENCES public.KORISNIK(id_korisnik),
  CONSTRAINT ZAHTJEV_ZA_PRIDRUZIVANJE_id_objava_fkey FOREIGN KEY (id_objava) REFERENCES public.OBJAVA(id_objava)
);
CREATE TABLE public.RECENZIJA (
  id_recenzija uuid NOT NULL DEFAULT gen_random_uuid(),
  id_autor uuid NOT NULL,
  id_primatelj uuid NOT NULL,
  id_objava uuid NOT NULL,
  ocjena integer NOT NULL CHECK (ocjena >= 1 AND ocjena <= 5),
  komentar text,
  datum_objave_recenzije timestamp with time zone DEFAULT now(),
  CONSTRAINT RECENZIJA_pkey PRIMARY KEY (id_recenzija),
  CONSTRAINT RECENZIJA_id_objava_fkey FOREIGN KEY (id_objava) REFERENCES public.OBJAVA(id_objava),
  CONSTRAINT RECENZIJA_id_autor_fkey FOREIGN KEY (id_autor) REFERENCES public.KORISNIK(id_korisnik),
  CONSTRAINT RECENZIJA_id_primatelj_fkey FOREIGN KEY (id_primatelj) REFERENCES public.KORISNIK(id_korisnik)
);
CREATE TABLE public.PRIJAVA_NEPRIMJERENOG_SADRZAJA (
  id_prijava uuid NOT NULL DEFAULT gen_random_uuid(),
  id_autor_prijave uuid NOT NULL,
  tip_prijave USER-DEFINED NOT NULL,
  id_prijavljenog_sadrzaja uuid NOT NULL,
  id_prijavljenog_korisnika uuid NOT NULL,
  razlog character varying NOT NULL,
  opis text,
  vrijeme_stvaranja_prijave timestamp with time zone DEFAULT now(),
  status_prijave USER-DEFINED DEFAULT 'zaprimljena'::status_prijave,
  poduzeta_mjera text,
  CONSTRAINT PRIJAVA_NEPRIMJERENOG_SADRZAJA_pkey PRIMARY KEY (id_prijava),
  CONSTRAINT PRIJAVA_NEPRIMJERENOG_SADRZAJA_id_autor_prijave_fkey FOREIGN KEY (id_autor_prijave) REFERENCES public.KORISNIK(id_korisnik),
  CONSTRAINT PRIJAVA_NEPRIMJERENOG_SADRZAJA_id_prijavljenog_korisnika_fkey FOREIGN KEY (id_prijavljenog_korisnika) REFERENCES public.KORISNIK(id_korisnik)
);
CREATE TABLE public.TROSKOVI (
  id_trosak uuid NOT NULL DEFAULT gen_random_uuid(),
  id_korisnik uuid NOT NULL,
  id_objava uuid NOT NULL,
  iznos numeric NOT NULL,
  rok_placanja timestamp with time zone NOT NULL,
  datum_placanja timestamp with time zone,
  status_placanja USER-DEFINED DEFAULT 'nepodmiren'::status_placanja,
  CONSTRAINT TROSKOVI_pkey PRIMARY KEY (id_trosak),
  CONSTRAINT TROSKOVI_id_korisnik_fkey FOREIGN KEY (id_korisnik) REFERENCES public.KORISNIK(id_korisnik),
  CONSTRAINT TROSKOVI_id_objava_fkey FOREIGN KEY (id_objava) REFERENCES public.OBJAVA(id_objava)
);
CREATE TABLE public.RAZGOVOR (
  id_razgovor uuid NOT NULL DEFAULT gen_random_uuid(),
  razgovor_tip USER-DEFINED DEFAULT 'izravan'::razgovor_tip,
  id_objava uuid NOT NULL,
  CONSTRAINT RAZGOVOR_pkey PRIMARY KEY (id_razgovor),
  CONSTRAINT RAZGOVOR_id_objava_fkey FOREIGN KEY (id_objava) REFERENCES public.OBJAVA(id_objava)
);
CREATE TABLE public.PORUKA (
  id_poruka uuid NOT NULL DEFAULT gen_random_uuid(),
  id_razgovor uuid NOT NULL,
  id_posiljatelj uuid NOT NULL,
  poruka text,
  vrijeme_slanja timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT PORUKA_pkey PRIMARY KEY (id_poruka),
  CONSTRAINT PORUKA_id_razgovor_fkey FOREIGN KEY (id_razgovor) REFERENCES public.RAZGOVOR(id_razgovor),
  CONSTRAINT PORUKA_id_posiljatelj_fkey FOREIGN KEY (id_posiljatelj) REFERENCES public.KORISNIK(id_korisnik)
);
CREATE TABLE public.SUGOVORNIK (
  id_razgovor uuid NOT NULL,
  id_sugovornik uuid NOT NULL,
  CONSTRAINT SUGOVORNIK_pkey PRIMARY KEY (id_razgovor, id_sugovornik),
  CONSTRAINT SUGOVORNIK_id_razgovor_fkey FOREIGN KEY (id_razgovor) REFERENCES public.RAZGOVOR(id_razgovor),
  CONSTRAINT SUGOVORNIK_id_sugovornik_fkey FOREIGN KEY (id_sugovornik) REFERENCES public.KORISNIK(id_korisnik)
);