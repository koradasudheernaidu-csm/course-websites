const issuerName = process.env.NEXT_PUBLIC_ISSUER_NAME || 'CourseBridge Learning Demo';

const categories = [
  { icon: '✳', name: 'Artificial Intelligence', count: '12 sample courses', tone: 'blue' },
  { icon: '▥', name: 'Data Science', count: '08 sample courses', tone: 'purple' },
  { icon: '⌘', name: 'Computer Science', count: '16 sample courses', tone: 'teal' },
  { icon: '◈', name: 'Business', count: '07 sample courses', tone: 'orange' }
];

const featured = [
  { partner: 'DEMO UNIVERSITY', title: 'Foundations of Machine Learning', subtitle: 'Build a strong foundation in supervised and unsupervised learning.', level: 'BEGINNER', duration: '6 WEEKS', badge: 'POPULAR' },
  { partner: 'INDUSTRY LEARNING PARTNER', title: 'Python for Data Analysis', subtitle: 'Explore practical data workflows with Python and notebooks.', level: 'INTERMEDIATE', duration: '4 WEEKS', badge: 'NEW' },
  { partner: 'DEMO TECHNOLOGY INSTITUTE', title: 'Introduction to Cloud Computing', subtitle: 'Understand cloud concepts, services and deployment models.', level: 'BEGINNER', duration: '5 WEEKS', badge: 'CAREER SKILL' }
];

export default function HomePage() {
  return <>
    <header className="cb-header">
      <nav className="cb-nav">
        <a className="cb-brand" href="/" aria-label="CourseBridge home"><span className="cb-brand-mark">c<span>.</span></span><strong>coursebridge</strong><small>LEARNING DEMO</small></a>
        <a className="cb-nav-link" href="#catalog">Explore <span>⌄</span></a>
        <a className="cb-nav-link" href="#partners">Learning partners</a>
        <a className="cb-nav-link" href="#certificates">Certificates</a>
        <form className="cb-search" action="#catalog"><span>⌕</span><input aria-label="Search sample courses" placeholder="What do you want to learn?" /><kbd>⌘ K</kbd></form>
        <div className="cb-nav-actions"><a href="/verify">Verify</a><a className="cb-login" href="/create">Issuer login</a></div>
      </nav>
    </header>

    <main>
      <section className="cb-hero">
        <div className="cb-hero-inner">
          <div className="cb-hero-copy">
            <div className="cb-overline"><span className="cb-overline-dot" /> LEARN SOMETHING THAT MOVES YOU FORWARD</div>
            <h1>Build skills.<br /><span>Open new doors.</span></h1>
            <p>Explore online learning experiences from university and industry-style partners. Complete a course and receive a shareable demonstration certificate.</p>
            <div className="cb-hero-search"><span>⌕</span><input aria-label="Find a course" placeholder="What skill would you like to build?" /><a href="#catalog">Explore courses <b>→</b></a></div>
            <div className="cb-hero-meta"><span>✓ Flexible online learning</span><span>✓ Partner-led courses</span><span>✓ Shareable records</span></div>
          </div>
          <div className="cb-hero-visual">
            <div className="cb-visual-orb orb-a" /><div className="cb-visual-orb orb-b" />
            <div className="cb-course-float float-top"><span className="float-icon">✳</span><div><b>New skills, new possibilities</b><small>Keep learning at your pace</small></div><span className="float-arrow">↗</span></div>
            <div className="cb-feature-card">
              <div className="feature-card-top"><span>FEATURED LEARNING PATH</span><span className="feature-badge">DEMO</span></div>
              <div className="feature-art"><div className="art-window"><span /><span /><span /><div className="art-chart"><i /><i /><i /><i /><i /><i /></div></div><div className="art-spark">✦</div><div className="art-cube">C</div></div>
              <div className="feature-card-body"><small>DEMO UNIVERSITY · COMPUTER SCIENCE</small><h2>Machine Learning<br />Foundations</h2><div className="feature-card-foot"><span>◷ 6 weeks</span><span>Beginner friendly</span><b>→</b></div></div>
            </div>
            <div className="cb-course-float float-bottom"><span className="float-avatar">✓</span><div><b>Progress worth sharing</b><small>Certificate record after completion</small></div></div>
          </div>
        </div>
      </section>

      <section className="cb-partners" id="partners">
        <p>LEARNING PARTNERS IN THIS DEMONSTRATION</p>
        <div><b>Northstar<span> University</span></b><b className="partner-ibm">nexa<span>lab</span></b><b className="partner-mono">◈ Vertex Academy</b><b className="partner-serif">The Open Learning Institute</b></div>
      </section>

      <section className="cb-section cb-category-section" id="catalog">
        <div className="cb-section-heading"><div><span className="cb-kicker">FIND YOUR NEXT SKILL</span><h2>Explore popular topics</h2><p>Choose a subject and start with a focused learning experience.</p></div><a href="#featured">Browse sample courses <b>→</b></a></div>
        <div className="cb-category-grid">{categories.map(item => <a className={`cb-category ${item.tone}`} href="#featured" key={item.name}><span className="category-icon">{item.icon}</span><span><b>{item.name}</b><small>{item.count}</small></span><i>↗</i></a>)}</div>
      </section>

      <section className="cb-section cb-featured-section" id="featured">
        <div className="cb-section-heading"><div><span className="cb-kicker">CURATED FOR THE CURIOUS</span><h2>Courses to get you started</h2><p>Illustrative course cards for the credential-platform demonstration.</p></div><span className="cb-demo-label">SAMPLE CATALOG</span></div>
        <div className="cb-course-grid">{featured.map((course, index) => <article className="cb-course-card" key={course.title}><div className={`course-illustration illustration-${index}`}><span className="course-chip">{course.badge}</span><div className="course-graphic">{index === 0 ? '✳' : index === 1 ? '◫' : '⌘'}</div><span className="course-art-label">LEARN / PRACTICE / GROW</span></div><div className="course-card-content"><small>{course.partner}</small><h3>{course.title}</h3><p>{course.subtitle}</p><div className="course-card-meta"><span>{course.level}</span><span>{course.duration}</span></div><a href="/create">Issue a demo certificate <b>→</b></a></div></article>)}</div>
      </section>

      <section className="cb-certificate-band" id="certificates"><div className="certificate-band-copy"><span className="cb-kicker">LEARNING THAT CAN BE SHARED</span><h2>Finish a course.<br /><span>Show what you know.</span></h2><p>Create a demonstration course certificate with a unique reference and QR-linked database verification.</p><div className="certificate-band-actions"><a className="cb-button cb-button-white" href="/verify">Verify a certificate <b>→</b></a><a className="cb-text-link" href="/create">Issuer workspace ↗</a></div></div><div className="mini-certificate"><div className="mini-cert-head"><span className="mini-partner-mark">N</span><span><b>NORTHSTAR UNIVERSITY</b><small>LEARNING PARTNER / DEMONSTRATION</small></span></div><div className="mini-cert-kicker">COURSE CERTIFICATE · SAMPLE</div><div className="mini-cert-name">Learner Name</div><p>has successfully completed</p><strong>Foundations of Machine Learning</strong><div className="mini-cert-foot"><span>COURSEBRIDGE DEMO</span><span className="mini-cert-seal">CB</span></div><div className="mini-cert-ribbon">SAMPLE</div></div></section>

      <section className="cb-demo-notice"><span>ⓘ</span><p><b>Academic demonstration portal.</b> CourseBridge is a fictional project identity. This website and its sample certificates are not affiliated with, issued by, endorsed by, or verified by Coursera or any real partner institution. Certificate checks query this project's own database and do not establish cryptographic authenticity.</p></section>
    </main>

    <footer className="cb-footer"><a className="cb-brand footer-brand" href="/"><span className="cb-brand-mark">c<span>.</span></span><strong>coursebridge</strong></a><span>{issuerName} · Learning & credential demonstration</span><div><a href="/verify">Verify</a><a href="/create">Issuer workspace</a></div><small>© 2026 CourseBridge Demo</small></footer>
  </>;
}
