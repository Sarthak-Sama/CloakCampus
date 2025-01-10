import { useState } from "react";

const TermsModal = ({ toggleTerms }) => {
  const [showTerms, setShowTerms] = useState(false);

  // Store Terms and Conditions as JSX elements for better structure and formatting
  const termsContent = (
    <>
      <h3 className="text-xl font-bold mb-4">Terms and Conditions</h3>
      <p className="text-sm mb-4">Last Updated: [Date]</p>
      <p>
        Welcome to CloakCampus. These Terms and Conditions ("Terms") govern your
        use of the CloakCampus platform, including the website and mobile
        application (the "App"). By accessing or using the App, you agree to
        comply with these Terms. If you do not agree with any of these Terms,
        please do not use the App.
      </p>

      <h4 className="font-semibold mt-4">1. Acceptance of Terms</h4>
      <p>
        By using CloakCampus, you accept and agree to abide by these Terms, our
        Privacy Policy, and any other policies or guidelines provided by the
        App. We reserve the right to modify these Terms at any time. Any changes
        will be posted here, and by continuing to use the App after such
        changes, you accept the updated Terms.
      </p>

      <h4 className="font-semibold mt-4">2. Account Registration</h4>
      <p>
        To access certain features of the App, you may need to register for an
        account. You agree to provide accurate, current, and complete
        information during registration and to update this information if it
        changes. You are responsible for maintaining the confidentiality of your
        account details, including your username and password.
      </p>

      <h4 className="font-semibold mt-4">3. Privacy and Data Collection</h4>
      <p>
        Your use of CloakCampus is also governed by our Privacy Policy. We may
        collect and process personal data as described in the Privacy Policy,
        and we encourage you to review it before using the App.
      </p>

      <h4 className="font-semibold mt-4">4. Use of the App</h4>
      <p>
        You agree to use CloakCampus for lawful purposes and in accordance with
        these Terms. You will not use the App to:
      </p>
      <ul className="list-disc ml-6">
        <li>Engage in any activity that is illegal, harmful, or disruptive.</li>
        <li>
          Post, upload, or share content that is offensive, defamatory,
          harassing, threatening, or discriminatory.
        </li>
        <li>
          Impersonate any person or entity or falsely claim an affiliation with
          any person or entity.
        </li>
        <li>
          Share any content that violates another user's privacy or intellectual
          property rights.
        </li>
      </ul>

      <h4 className="font-semibold mt-4">5. Content</h4>
      <p>
        The content you post on the App is your responsibility. By posting
        content, you grant CloakCampus a worldwide, royalty-free, non-exclusive
        license to use, display, and distribute such content. We do not claim
        ownership of your content, but we may moderate or remove it if it
        violates these Terms or is deemed inappropriate.
      </p>

      <h4 className="font-semibold mt-4">6. Anonymity</h4>
      <p>
        CloakCampus allows users to remain anonymous. You agree not to disclose
        any personally identifiable information within your posts or
        interactions unless required by law or for safety reasons.
      </p>

      <h4 className="font-semibold mt-4">7. Prohibited Conduct</h4>
      <p>You agree not to:</p>
      <ul className="list-disc ml-6">
        <li>
          Use the App in any way that could harm, disable, or interfere with its
          proper functioning.
        </li>
        <li>
          Attempt to gain unauthorized access to the App, other users' accounts,
          or the App’s server.
        </li>
        <li>
          Engage in any form of data scraping, harvesting, or other data
          collection methods without permission.
        </li>
        <li>
          Post or share content that violates intellectual property rights or
          other proprietary rights.
        </li>
      </ul>

      <h4 className="font-semibold mt-4">8. Reporting and Moderation</h4>
      <p>
        If you encounter content or behavior that violates these Terms, you are
        encouraged to report it to the CloakCampus support team. We may remove
        or moderate content at our discretion to maintain a safe and respectful
        environment for all users.
      </p>

      <h4 className="font-semibold mt-4">9. Termination</h4>
      <p>
        We reserve the right to suspend or terminate your account and access to
        the App at our discretion, with or without notice, if you violate these
        Terms. You may terminate your account at any time by contacting our
        support team.
      </p>

      <h4 className="font-semibold mt-4">10. Disclaimers</h4>
      <p>
        CloakCampus is provided on an "as-is" and "as-available" basis. We do
        not guarantee that the App will always be available, error-free, or meet
        your expectations. We are not responsible for any content posted by
        users or any actions taken based on that content. We do not guarantee
        the accuracy, completeness, or reliability of any information shared on
        the App.
      </p>

      <h4 className="font-semibold mt-4">11. Limitation of Liability</h4>
      <p>
        To the fullest extent permitted by law, CloakCampus and its affiliates,
        partners, and service providers are not liable for any indirect,
        incidental, special, or consequential damages arising from your use or
        inability to use the App, including but not limited to loss of data,
        reputation, or profits.
      </p>

      <h4 className="font-semibold mt-4">12. Indemnification</h4>
      <p>
        You agree to indemnify and hold CloakCampus harmless from any claims,
        damages, losses, or expenses arising from your use of the App or your
        violation of these Terms.
      </p>

      <h4 className="font-semibold mt-4">13. Governing Law</h4>
      <p>
        These Terms are governed by the laws of [Country/State], without regard
        to its conflict of law principles. Any disputes arising from these Terms
        or your use of the App will be resolved in the courts located in
        [Location].
      </p>

      <h4 className="font-semibold mt-4">14. Changes to Terms</h4>
      <p>
        We reserve the right to modify or update these Terms at any time. Any
        changes will be posted on this page, and your continued use of the App
        after any such changes will constitute your acceptance of the updated
        Terms.
      </p>

      <h4 className="font-semibold mt-4">15. Contact Information</h4>
      <p>
        If you have any questions or concerns about these Terms, please contact
        us at:
      </p>
      <p>CloakCampus Support Team</p>
      <p>Email: [support@cloakcampus.com]</p>
      <p>Phone: [Your Contact Number]</p>
      <p>Address: [Your Company Address]</p>
    </>
  );
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-[#161616] dark:text-[#EDEDED] p-6 rounded shadow-lg w-[80%] lg:w-[50%] overflow-y-auto max-h-[80%]">
        {termsContent}

        <button
          onClick={toggleTerms}
          className="mt-4 py-2 px-4 bg-[#EA516F] text-white rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default TermsModal;
