/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Footer from '@theme/Footer';
import { Companies } from '../ui/home/companies';
import { Features } from '../ui/home/features';
import { FrameworkDetails } from '../ui/home/framework-details';
import { ContactUs } from '../ui/home/contact-us';
import { Intro } from '../ui/home/intro';

export default function Index() {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;
  const { tagline, url } = siteConfig;

  const ogImage = `${url}/img/graphql-modules-cover.png`;

  return (
    <Layout description={tagline} image={ogImage} permalink={url} noFooter>
      <div className="backgroundTop"></div>
      <Intro />
      <Companies />
      <Features />
      <FrameworkDetails />
      <ContactUs />
      <Footer />
    </Layout>
  );
}
