import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/**
 * Downloads a DOM element as a PDF.
 * This clones the element to apply light theme for better PDF visibility.
 */
export async function downloadElementAsPDF(element: HTMLElement, filename: string) {
    // Create a clone to avoid disrupting the UI
    const clone = element.cloneNode(true) as HTMLElement;

    // A4 Dimensions in mm
    const PDF_WIDTH_MM = 210;
    const PDF_HEIGHT_MM = 297;
    const MARGIN_MM = 15;
    const CONTENT_WIDTH_MM = PDF_WIDTH_MM - (2 * MARGIN_MM);
    const CONTENT_HEIGHT_MM = PDF_HEIGHT_MM - (2 * MARGIN_MM);

    // Apply styling to the clone for PDF
    // Fixed width 800px is a good resolution for A4
    const CLONE_WIDTH_PX = 800;
    clone.style.width = `${CLONE_WIDTH_PX}px`;
    clone.style.padding = "40px"; // This acts as internal padding, but we also handle page breaks manually
    clone.style.position = "fixed";
    clone.style.left = "-9999px";
    clone.style.top = "0";
    clone.style.background = "white";
    clone.style.color = "black";
    clone.classList.add("light"); // Force light theme for Tailwind if applicable
    clone.classList.remove("dark");

    // Override oklch CSS variables with standard colors in the clone
    // html2canvas cannot parse oklch() colors used in Tailwind 4 / shadcn
    clone.style.setProperty("--background", "white");
    clone.style.setProperty("--foreground", "black");
    clone.style.setProperty("--card", "white");
    clone.style.setProperty("--card-foreground", "black");
    clone.style.setProperty("--popover", "white");
    clone.style.setProperty("--popover-foreground", "black");
    clone.style.setProperty("--primary", "#000000");
    clone.style.setProperty("--primary-foreground", "#ffffff");
    clone.style.setProperty("--secondary", "#f1f1f1");
    clone.style.setProperty("--secondary-foreground", "#000000");
    clone.style.setProperty("--muted", "#f1f1f1");
    clone.style.setProperty("--muted-foreground", "#666666");
    clone.style.setProperty("--accent", "#f1f1f1");
    clone.style.setProperty("--accent-foreground", "#000000");
    clone.style.setProperty("--border", "#e5e7eb");
    clone.style.setProperty("--input", "#e5e7eb");
    clone.style.setProperty("--ring", "#000000");

    // Ensure all text is black and remove problematic color functions for html2canvas
    const allElements = clone.querySelectorAll("*");
    allElements.forEach((el) => {
        const htmlEl = el as HTMLElement;

        // Force black text for contrast in PDF
        htmlEl.style.color = "black";

        // Remove any inline styles that might use oklch or lab
        const colorProps = ['backgroundColor', 'borderColor', 'color', 'outlineColor', 'textDecorationColor', 'boxShadow'];
        colorProps.forEach(prop => {
            const style = htmlEl.style as any;
            const val = style[prop];
            if (val && (val.includes("oklch") || val.includes("lab"))) {
                style[prop] = ""; // Clear inline modern colors
            }
        });

        // Some specific overrides for our markdown renderer components
        if (htmlEl.tagName === 'H2' || htmlEl.classList.contains('bg-muted/50')) {
            htmlEl.style.backgroundColor = "#f3f4f6"; // Light gray
            htmlEl.style.borderLeftColor = "#8b5cf6"; // Purple
        }
    });

    document.body.appendChild(clone);

    // --- Smart Pagination Logic ---
    // We calculate "Page Height" in pixels relative to the clone's width
    const pxPerMm = CLONE_WIDTH_PX / CONTENT_WIDTH_MM;
    const pageHeightPx = CONTENT_HEIGHT_MM * pxPerMm;

    const children = Array.from(clone.children) as HTMLElement[];
    for (const child of children) {
        const rect = child.getBoundingClientRect();
        const cloneRect = clone.getBoundingClientRect();

        // Calculate position relative to the top of the content (ignoring initial padding of clone if any, 
        // but we want to start counting pages from the top of the clone content)
        // Note: clone.style.padding = "40px" adds checking complexity.
        // Let's rely on relative position from the *top of the clone element* including padding,
        // because html2canvas captures the padding too.
        // Actually, if we want strict paging, we should treat '0' as clone top.

        const relativeTop = rect.top - cloneRect.top;
        const relativeBottom = relativeTop + rect.height;

        // Only process visible elements
        if (rect.height === 0) continue;

        const pageIndex = Math.floor(relativeTop / pageHeightPx);
        const pageBottomBoundary = (pageIndex + 1) * pageHeightPx;

        // If the element crosses the bottom boundary of the page
        // AND isn't larger than a full page itself (in which case we can't do much)
        if (relativeBottom > pageBottomBoundary && rect.height < pageHeightPx) {
            // Calculate how much space to add to push it to the next page
            const pushHeight = pageBottomBoundary - relativeTop + 20; // +20px buffer for clean break

            const spacer = document.createElement('div');
            spacer.style.height = `${pushHeight}px`;
            spacer.style.width = '100%';
            spacer.style.display = 'block';
            spacer.setAttribute('data-pdf-spacer', 'true'); // Marker

            // Insert spacer
            clone.insertBefore(spacer, child);
        }
    }
    // ----------------------------

    try {
        const canvas = await html2canvas(clone, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: "#ffffff",
            onclone: (clonedDoc: Document) => {
                // Final pass to strip any oklch/lab colors that html2canvas cannot parse
                const elements = clonedDoc.querySelectorAll("*");
                elements.forEach((el: Element) => {
                    const htmlEl = el as HTMLElement;
                    const style = window.getComputedStyle(htmlEl);
                    if (style.backgroundColor.includes("oklch") || style.backgroundColor.includes("lab")) {
                        htmlEl.style.backgroundColor = "white";
                    }
                    if (style.color.includes("oklch") || style.color.includes("lab")) {
                        htmlEl.style.color = "black";
                    }
                    if (style.borderColor.includes("oklch") || style.borderColor.includes("lab")) {
                        htmlEl.style.borderColor = "#e5e7eb";
                    }
                });
            }
        } as any);

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        // Add margins (matches the constants derived earlier)
        const margin = MARGIN_MM;
        const contentWidth = CONTENT_WIDTH_MM;
        const contentHeight = CONTENT_HEIGHT_MM;

        const imgProps = pdf.getImageProperties(imgData);
        // Scale image to fit content width
        const imgHeight = (imgProps.height * contentWidth) / imgProps.width;

        let heightLeft = imgHeight;
        let page = 0;

        while (heightLeft > 0) {
            if (page > 0) {
                pdf.addPage();
            }

            // Position the image so the correct slice is visible
            const position = margin - (page * contentHeight);
            pdf.addImage(imgData, "PNG", margin, position, contentWidth, imgHeight);

            // Add white masks to create clean margins
            // Top mask (for all pages, to ensure clean top margin)
            if (page > 0 || margin > 0) {
                pdf.setFillColor(255, 255, 255);
                pdf.rect(0, 0, pdfWidth, margin, "F");
            }

            // Bottom mask (to ensure clean bottom margin)
            pdf.setFillColor(255, 255, 255);
            pdf.rect(0, pdfHeight - margin, pdfWidth, margin, "F");

            heightLeft -= contentHeight;
            page++;
        }

        pdf.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
    } catch (error) {
        console.error("Error generating PDF:", error);
        throw error;
    } finally {
        document.body.removeChild(clone);
    }
}
