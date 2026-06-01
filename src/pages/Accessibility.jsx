import { motion } from "framer-motion";

const sections = [
  {
    title: "What web accessibility is",
    content:
      "An accessible site allows visitors with disabilities to browse the site with the same or a similar level of ease and enjoyment as other visitors. This can be achieved with the capabilities of the system on which the site is operating, and through assistive technologies.",
  },
  {
    title: "Accessibility adjustments on this site",
    content:
      "We have adapted this site in accordance with WCAG 2.1 guidelines, and have made the site accessible to the level of AA. This site's contents have been adapted to work with assistive technologies, such as screen readers and keyboard use. As part of this effort, we have also:",
    list: [
      "Used the Accessibility Wizard to find and fix potential accessibility issues",
      "Set the language of the site",
      "Set the content order of the site's pages",
      "Defined clear heading structures on all of the site's pages",
      "Added alternative text to images",
      "Implemented color combinations that meet the required color contrast",
      "Reduced the use of motion on the site",
      "Ensured all videos, audio, and files on the site are accessible",
    ],
  },
  {
    title: "Declaration of partial compliance with the standard due to third-party content",
    content:
      "The accessibility of certain pages on the site depend on contents that do not belong to the organization, and instead belong to third parties. We therefore declare partial compliance with the standard for these pages.",
  },
  {
    title: "Requests, issues and suggestions",
    content:
      "If you find an accessibility issue on the site, or if you require further assistance, you are welcome to contact us through the organization's accessibility coordinator.",
  },
];

export default function Accessibility() {
  return (
    <div className="min-h-screen">
      <section className="pt-40 pb-24 px-[4%] md:px-[2%] max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-[760px]"
        >
          <p className="font-body text-xs tracking-label uppercase text-muted-foreground mb-4">Legal</p>
          <h1 className="font-display text-display-lg font-light mb-6">
            Accessibility Statement
          </h1>
          <p className="font-body text-sm text-muted-foreground leading-relaxed mb-12">
            This statement was last updated on [enter relevant date].
          </p>

          <p className="font-body text-base text-foreground leading-relaxed mb-16">
            We at [enter organization / business name] are working to make our site [enter site name and address] accessible to people with disabilities.
          </p>

          <div className="space-y-14">
            {sections.map((section, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
              >
                <div className="hairline mb-8" />
                <h2 className="font-display text-display-sm font-light mb-4">{section.title}</h2>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">
                  {section.content}
                </p>
                {section.list && (
                  <ul className="mt-4 space-y-2">
                    {section.list.map((item, j) => (
                      <li key={j} className="font-body text-sm text-muted-foreground leading-relaxed flex gap-3">
                        <span className="text-accent mt-1">—</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  );
}