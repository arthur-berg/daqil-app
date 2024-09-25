import { Button } from "@/components/ui/button";

const StepFive = ({
  form,
  onPrevStep,
  t,
}: {
  form: any;
  onPrevStep: () => void;
  t: any;
}) => {
  const accountType = form.getValues("accountType");
  const country = form.getValues("country");
  const paymentMethod = form.getValues("paymentMethod");

  return (
    <div>
      <h2 className="text-lg font-bold">{t("reviewAndSubmit")}</h2>

      <div className="mt-4">
        <h3 className="font-medium">{t("generalInfo")}</h3>
        <p>
          {t("country")}: {country}
        </p>
        <p>
          {t("paymentMethod")}: {paymentMethod}
        </p>
        <p>
          {t("accountType")}: {t(accountType)}
        </p>
      </div>

      {accountType === "personal" && (
        <div className="mt-4">
          <h3 className="font-medium">{t("personalDetails")}</h3>
          <p>
            {t("firstName")}: {form.getValues("firstName")}
          </p>
          <p>
            {t("lastName")}: {form.getValues("lastName")}
          </p>
          <p>
            {t("dob")}: {form.getValues("dob")}
          </p>
          <p>
            {t("placeOfBirth")}: {form.getValues("placeOfBirth")}
          </p>
          <p>
            {t("citizenship")}: {form.getValues("citizenship")}
          </p>
          <h3 className="font-medium mt-4">{t("bankDetails")}</h3>
          <p>
            {t("bankName")}: {form.getValues("bankName")}
          </p>
          <p>
            {t("accountSubtype")}: {form.getValues("accountSubtype")}
          </p>
          <p>
            {t("accountNumber")}: {form.getValues("accountNumber")}
          </p>
        </div>
      )}

      {accountType === "company" && (
        <div className="mt-4">
          <h3 className="font-medium">{t("companyDetails")}</h3>
          <p>
            {t("ownerName")}: {form.getValues("ownerName")}
          </p>
          <p>
            {t("ownerRole")}: {form.getValues("ownerRole")}
          </p>
          <p>
            {t("companyRegistration")}: {form.getValues("companyRegistration")}
          </p>
          <h3 className="font-medium mt-4">{t("bankDetails")}</h3>
          <p>
            {t("bankName")}: {form.getValues("bankName")}
          </p>
          <p>
            {t("iban")}: {form.getValues("iban")}
          </p>
          <p>
            {t("swift")}: {form.getValues("swift")}
          </p>
        </div>
      )}

      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={onPrevStep}>
          {t("back")}
        </Button>
        <Button type="submit">{t("submit")}</Button>
      </div>
    </div>
  );
};

export default StepFive;
